import apiClient from './client'

export interface HealthResponse {
  status: string
  service: string
  version: string
}

export interface VersionResponse {
  name: string
  version: string
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/health')
  return response.data
}

export async function getReady(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/ready')
  return response.data
}

export async function getVersion(): Promise<VersionResponse> {
  const response = await apiClient.get<VersionResponse>('/version')
  return response.data
}