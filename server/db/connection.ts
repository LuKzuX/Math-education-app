import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL as string
const supabaseKey = process.env.SUPABASE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)

export const connect = async () => {
  try {
    const { data, error } = await supabase.rpc('version')
    if (error) {
      console.error('Unable to reach Supabase:', error)
    } else {
      console.log('Supabase reachable')
    }
  } catch (error) {
    console.error('Error connecting to Supabase:', error)
  }
}
