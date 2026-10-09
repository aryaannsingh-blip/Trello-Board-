import axios from 'axios'

const TOKEN_KEY = 'trello_token'
export const API_URL = 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.token = token
  return config
})

export const auth = {
  signup: (username, password) =>
    api.post('/signup', { username, password }).then((r) => r.data),
  signin: (username, password) =>
    api.post('/signin', { username, password }).then((r) => r.data),
}

export const organizations = {
  create: (title, description) =>
    api.post('/organization', { title, description }).then((r) => r.data),
  get: (organizationId) =>
    api
      .get('/organization', { params: { organizationId } })
      .then((r) => r.data.organization),
  getBoards: (organizationId) =>
    api
      .get('/boards', { params: { organizationId } })
      .then((r) => r.data.boards),
  getMembers: (organizationId) =>
    api
      .get('/members', { params: { organizationId } })
      .then((r) => r.data.member),
  addMember: (organizationId, memberUserUsername) =>
    api
      .post('/add-member-to-organization', { organizationId, memberUserUsername })
      .then((r) => r.data),
  removeMember: (organizationId, memberUserUsername) =>
    api
      .delete('/members', { data: { organizationId, memberUserUsername } })
      .then((r) => r.data),
}

export const boards = {
  create: (title, organizationId) =>
    api.post('/boards', { title, organizationId }).then((r) => r.data),
  getIssues: (boardId) =>
    api.get('/issues', { params: { boardId } }).then((r) => r.data.issues),
  createIssue: (title, boardId, status, assignedTo) =>
    api
      .post('/issues', { title, boardId, status, assignedTo })
      .then((r) => r.data),
  updateIssue: (issueId, updates) =>
    api.put('/issues', { issueId, ...updates }).then((r) => r.data),
}

export default api