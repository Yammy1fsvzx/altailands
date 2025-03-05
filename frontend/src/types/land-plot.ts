import { StaticImport } from "next/dist/shared/lib/get-img-props"

export type PlotStatus = 'available' | 'reserved' | 'sold'

export interface Terrain {
  isNearRiver: boolean
  isNearMountains: boolean
  isNearForest: boolean
  isNearLake: boolean
  hasViewOnMountains: boolean
  landscape: string
  elevation: number
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface Image {
  id: number
  filename: string
  path: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
}

export interface Description {
  text: string
  attachments: Attachment[]
}

export interface LandPlot {
  id: string
  title: string
  description: Description
  cadastral_numbers: string[]
  area: number
  specified_area: number
  price: number
  price_per_meter: number
  location: string
  region: string
  land_category: string
  permitted_use: string
  features: string[]
  terrain: Terrain
  communications: string[]
  status: PlotStatus
  coordinates: Coordinates
  images: Image[]
  is_visible: boolean
} 