'use server'

import { createClient } from '@/utils/supabase/server'
import { Tables } from '@/types/supabase'

export async function searchEvents(input: string): Promise<(Tables<'Event'> & { type: 'event' })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Event')
    .select('*')
    .ilike('EventName', `%${input}%`)
    .limit(10)

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data.map(event => ({ ...event, type: 'event' }))
}