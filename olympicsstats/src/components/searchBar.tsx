'use client'

import React from 'react'
import { DialogProps } from '@radix-ui/react-dialog'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'

import { searchAthletes } from '@/dao/athleteDao'
import { searchEvents } from '@/dao/eventDao'
import { searchSports } from '@/dao/sportDao'
import { searchOlympicGames } from '@/dao/olympicGameDao'

import { Tables } from '@/types/supabase'

type SearchResult =
  | (Tables<'Athlete'> & { type: 'athlete' })
  | (Tables<'Event'> & { type: 'event' })
  | (Tables<'Sport'> & { type: 'sport' })
  | (Tables<'OlympicGame'> & { type: 'olympicGame' })

export default function SearchBar ({ ...props }: DialogProps) {
  const [open, setOpen] = React.useState(false)
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const router = useRouter()

  const fetchSearchResults = async (input: string) => {
    const results = await Promise.all([
      searchAthletes(input),
      searchEvents(input),
      searchSports(input),
      searchOlympicGames(input)
    ])
    setSearchResults(results.flat())
  }

  React.useEffect(() => {
    fetchSearchResults('')

    const down = (e: KeyboardEvent) => {
      if ((e.key === 'a' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const navigateToPage = (item: SearchResult) => {
    switch (item.type) {
      case 'athlete':
        router.push(`/athlete/${item.Id}`)
        break
      case 'event':
        router.push(`/event/${item.Id}`)
        break
      case 'sport':
        router.push(`/sport/${item.Id}`)
        break
      case 'olympicGame':
        router.push(`/olympic-game/${item.Id}`)
        break
    }
  }

  return (
    <>
      <Button
        variant='outline'
        className={cn(
          'relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className='hidden lg:inline-flex'>Search Olympics...</span>
        <span className='inline-flex lg:hidden'>Search...</span>
        <kbd className='pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex'>
          <span className='text-xs'>⌘</span>A
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder='Search Athletes, Events, Sports, Olympics...'
          onInput={e =>
            fetchSearchResults((e.target as HTMLInputElement).value)
          }
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {['Athlete', 'Event', 'Sport', 'Olympic Game'].map(category => (
            <CommandGroup key={category} heading={category}>
              {searchResults
                .filter(item => {
                  if (category === 'Olympic Game') {
                    return item.type === 'olympicGame'
                  }
                  return item.type === category.toLowerCase()
                })
                .map(item => (
                  <CommandItem
                    key={item.Id}
                    value={
                      item.type === 'athlete'
                        ? item.Athlete_Name ?? ''
                        : item.type === 'olympicGame'
                        ? `${item.City} ${item.Year}`
                        : 'SportName' in item
                        ? item.SportName ?? ''
                        : item.EventName ?? ''
                    }
                    onSelect={() => runCommand(() => navigateToPage(item))}
                  >
                    <ArrowRight className='mr-2 h-4 w-4' />
                    {item.type === 'athlete'
                      ? item.Athlete_Name
                      : item.type === 'olympicGame'
                      ? `${item.City} ${item.Year}`
                      : 'SportName' in item
                      ? item.SportName
                      : item.EventName}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
