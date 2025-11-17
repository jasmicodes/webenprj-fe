export type Post = {
  id: number
  user: { name: string; avatar: string }
  tag: string
  time: string
  text: string
  image?: string
  likes: number
  comments: number
  streak: number
}

import avatar1 from '@/assets/user1.avif'
import avatar2 from '@/assets/user2.avif'
import avatar3 from '@/assets/user3.avif'
import sampleImg from '@/assets/PostPicture1.png'

// DEMO Data
export const POSTS: Post[] = [
  {
    id: 1,
    user: { name: 'mariasantos', avatar: avatar1 },
    tag: 'webengineering',
    time: '2d',
    text: 'Today I finally understood async/await…',
    image: sampleImg,
    likes: 12,
    comments: 3,
    streak: 25,
  },
  {
    id: 2,
    user: { name: 'linus', avatar: avatar2 },
    tag: 'statistics',
    time: '1d',
    text: 'Cheat sheet: t-Test quick ref',
    image: sampleImg,
    likes: 8,
    comments: 2,
    streak: 9,
  },
  {
    id: 3,
    user: { name: 'stefan', avatar: avatar3 },
    tag: 'bwl',
    time: '3h',
    text: 'Cost accounting basics',
    image: sampleImg,
    likes: 3,
    comments: 0,
    streak: 4,
  },
]
