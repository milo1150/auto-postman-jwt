import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config() // Load .env

const POSTMAN_ENV_NAME = process.env.POSTMAN_ENV_NAME
const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY
const POSTMAN_JWT_VARIABLE = process.env.POSTMAN_JWT_VARIABLE

interface PostmanEnvironmentList {
  environments: EnvironmentMeta[]
}

interface EnvironmentMeta {
  id: string
  name: string
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  owner: string
  uid: string
  isPublic: boolean
}

interface PostmanVariable {
  key: string
  value: any
  type: string
  enabled: boolean
}

interface PostmanEnvironment {
  id: string
  name: string
  uid: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  values: PostmanVariable[]
}
interface GetEnvResponse {
  environment: PostmanEnvironment
}

export async function updatePostmanJwt(jwtToken: string) {
  if (!POSTMAN_ENV_NAME) {
    console.error('Missing POSTMAN_ENV_NAME', POSTMAN_ENV_NAME)
    return
  }

  if (!POSTMAN_API_KEY) {
    console.error('Missing POSTMAN_API_KEY', POSTMAN_API_KEY)
    return
  }

  if (!POSTMAN_JWT_VARIABLE) {
    console.error('Missing POSTMAN_JWT_VARIABLE', POSTMAN_JWT_VARIABLE)
    return
  }

  // Get Postman environment list
  const environmentsResponse = await axios
    .get<PostmanEnvironmentList>(`https://api.getpostman.com/environments/`, {
      headers: {
        'X-Api-Key': POSTMAN_API_KEY,
      },
    })
    .then((res) => {
      console.log('Postman Environments:', res.data.environments)
      return res.data.environments
    })

  // Get specific environment
  const specificEnv = environmentsResponse.find(
    (meta) => meta.name === POSTMAN_ENV_NAME
  )
  if (!specificEnv) {
    console.error('Postman specific env not match with POSTMAN_ENV_NAME')
    return
  }
  const envUID = specificEnv.uid

  // Get specific env value
  const environmentUIDResponse = await axios
    .get<GetEnvResponse>(`https://api.getpostman.com/environments/${envUID}`, {
      headers: {
        'X-Api-Key': POSTMAN_API_KEY,
      },
    })
    .then((res) => {
      console.log('Headers', res.headers)
      console.log('Postman Environment by UID:', res.data.environment)
      return res.data.environment
    })

  // Copy
  let environmentValues = { ...environmentUIDResponse }.values

  // Remove current jwt value from postman environment
  const existedJwtVariable = environmentValues.find(
    (obj) => obj.key === POSTMAN_JWT_VARIABLE
  )
  if (existedJwtVariable) {
    environmentValues = environmentValues.filter(
      (v) => v.key !== POSTMAN_JWT_VARIABLE
    )
    console.log('Remove JWT from environments', environmentValues)
    await updatePostmanEnvironments(
      envUID,
      environmentUIDResponse,
      environmentValues
    ).catch((err) => {
      return console.error(err)
    })
    await sleep(2000) // wait for 2 seconds
  }

  // Create new jwt value (Initial value and Current value)
  // Postman API can't update current value, can update only initial value, this why need to remove and paste a new one.
  const newJwtTokenVariable: PostmanVariable = {
    key: POSTMAN_JWT_VARIABLE,
    value: jwtToken,
    enabled: true,
    type: 'default',
  }
  environmentValues.push(newJwtTokenVariable)
  console.log('Create new JWT', environmentValues)
  await updatePostmanEnvironments(
    envUID,
    environmentUIDResponse,
    environmentValues
  ).catch((err) => {
    return console.error(err)
  })

  console.log('✅ Postman variable updated.')
}

async function updatePostmanEnvironments(
  envUID: string,
  environmentUIDResponse: PostmanEnvironment,
  environmentValues: PostmanVariable[]
) {
  return await axios.put(
    `https://api.getpostman.com/environments/${envUID}`,
    {
      environment: {
        ...environmentUIDResponse,
        values: environmentValues,
      },
    },
    {
      headers: {
        'X-Api-Key': POSTMAN_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
