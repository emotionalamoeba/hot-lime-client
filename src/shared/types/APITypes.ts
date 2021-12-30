import { UID } from "./types"

interface UserDetails { userName: string, serverUID: number }

interface UserListUpdate { sessionKey: UID, userList: UserDetails[] }

interface MessageUpdate { sessionKey: UID, userID: number | 'Broadcast', text: string }

export { UserDetails, UserListUpdate, MessageUpdate }