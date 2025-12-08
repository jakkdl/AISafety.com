// Base Airtable record type
export interface AirtableRecord<T = unknown> {
  id: string
  fields: T
  createdTime: string
}

// Add your specific table types here
// Example:
// export interface BlogPost {
//   title: string
//   content: string
//   published: boolean
//   publishDate: string
// }
