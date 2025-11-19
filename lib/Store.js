import { useState, useEffect } from 'react'
import { supabase } from './supabase'  // ✅ centralized client

/**
 * @param {number} channelId the currently selected Channel
 */
export const useStore = (props) => {
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [users] = useState(new Map())
  const [newMessage, handleNewMessage] = useState(null)
  const [newChannel, handleNewChannel] = useState(null)
  const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState(null)
  const [deletedChannel, handleDeletedChannel] = useState(null)
  const [deletedMessage, handleDeletedMessage] = useState(null)

  // Load initial data and set up listeners
  useEffect(() => {
    fetchChannels(setChannels)

    const messageListener = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) =>
        handleNewMessage(payload.new)
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) =>
        handleDeletedMessage(payload.old)
      )
      .subscribe()

    const userListener = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) =>
        handleNewOrUpdatedUser(payload.new)
      )
      .subscribe()

    const channelListener = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'channels' }, (payload) =>
        handleNewChannel(payload.new)
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'channels' }, (payload) =>
        handleDeletedChannel(payload.old)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(supabase.channel(messageListener))
      supabase.removeChannel(supabase.channel(userListener))
      supabase.removeChannel(supabase.channel(channelListener))
    }
  }, [])

  useEffect(() => {
    if (props?.channelId > 0) {
      fetchMessages(props.channelId, (messages) => {
        messages.forEach((x) => users.set(x.user_id, x.author))
        setMessages(messages)
      })
    }
  }, [props.channelId])

  useEffect(() => {
    if (newMessage && newMessage.channel_id === Number(props.channelId)) {
      const handleAsync = async () => {
        let authorId = newMessage.user_id
        if (!users.get(authorId)) await fetchUser(authorId, (user) => handleNewOrUpdatedUser(user))
        setMessages(messages.concat(newMessage))
      }
      handleAsync()
    }
  }, [newMessage])

  useEffect(() => {
    if (deletedMessage) setMessages(messages.filter((message) => message.id !== deletedMessage.id))
  }, [deletedMessage])

  useEffect(() => {
    if (newChannel) setChannels(channels.concat(newChannel))
  }, [newChannel])

  useEffect(() => {
    if (deletedChannel) setChannels(channels.filter((channel) => channel.id !== deletedChannel.id))
  }, [deletedChannel])

  useEffect(() => {
    if (newOrUpdatedUser) users.set(newOrUpdatedUser.id, newOrUpdatedUser)
  }, [newOrUpdatedUser])

  return {
    messages: messages.map((x) => ({ ...x, author: users.get(x.user_id) })),
    channels: channels !== null ? channels.sort((a, b) => a.slug.localeCompare(b.slug)) : [],
    users,
  }
}

// ------------------- Fetch / CRUD functions -------------------

export const fetchChannels = async (setState) => {
  try {
    let { data } = await supabase.from('channels').select('*')
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

export const fetchUser = async (userId, setState) => {
  try {
    let { data } = await supabase.from('users').select(`*`).eq('id', userId)
    let user = data[0]
    if (setState) setState(user)
    return user
  } catch (error) {
    console.log('error', error)
  }
}

export const fetchMessages = async (channelId, setState) => {
  try {
    let { data } = await supabase
      .from('messages')
      .select(`*, author:user_id(*)`)
      .eq('channel_id', channelId)
      .order('inserted_at', { ascending: true })
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

export const addChannel = async (slug, user_id) => {
  try {
    let { data } = await supabase.from('channels').insert([{ slug, created_by: user_id }]).select()
    return data
  } catch (error) {
    console.log('error', error)
  }
}

export const addMessage = async (message, channel_id, user_id) => {
  try {
    let { data } = await supabase.from('messages').insert([{ message, channel_id, user_id }]).select()
    return data
  } catch (error) {
    console.log('error', error)
  }
}

export const deleteChannel = async (channel_id) => {
  try {
    let { data } = await supabase.from('channels').delete().match({ id: channel_id })
    return data
  } catch (error) {
    console.log('error', error)
  }
}

export const deleteMessage = async (message_id) => {
  try {
    let { data } = await supabase.from('messages').delete().match({ id: message_id })
    return data
  } catch (error) {
    console.log('error', error)
  }
}
