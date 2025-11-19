// pages/channels/[id].js
import Layout from '~/components/Layout'
import Message from '~/components/Message'
import MessageInput from '~/components/MessageInput'
import { useRouter } from 'next/router'
import { useStore, addMessage } from '~/lib/Store'
import { useContext, useEffect, useRef } from 'react'
import UserContext from '~/lib/UserContext'

const ChannelsPage = () => {
  const router = useRouter()
  const { user, userLoaded, signOut } = useContext(UserContext)
  const messagesEndRef = useRef(null)

  const { id: channelId } = router.query
  const { messages, channels } = useStore({ channelId: Number(channelId) })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    })
  }, [messages])

  // Redirect to public channel if current channel is deleted
  useEffect(() => {
    if (channels.length > 0 && !channels.some((channel) => channel.id === Number(channelId))) {
      router.push('/channels/1')
    }
  }, [channels, channelId])

  if (!userLoaded) {
    return <div>Loading...</div>
  }

  return (
    <Layout channels={channels} activeChannelId={Number(channelId)}>
      <div className="relative h-screen">
        <div className="Messages h-full pb-16">
          <div className="p-2 overflow-y-auto">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} style={{ height: 0 }} />
          </div>
        </div>
        <div className="p-2 absolute bottom-0 left-0 w-full">
          <MessageInput
            onSubmit={async (text) => {
              if (user) {
                await addMessage(text, Number(channelId), user.id)
              }
            }}
          />
        </div>
      </div>
    </Layout>
  )
}

export default ChannelsPage
