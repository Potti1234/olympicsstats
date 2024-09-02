import { getAthleteById, getAthleteResults } from '@/dao/athleteDao'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

export default async function AthleteDetails ({
  params
}: {
  params: { athlete_id: string }
}) {
  const athleteId = params.athlete_id
  const athlete = await getAthleteById(athleteId)
  const results = await getAthleteResults(athleteId)

  // Sort results by year in descending order
  const sortedResults = results.sort((a, b) => {
    const yearA = a.OlympicGame?.Year || 0
    const yearB = b.OlympicGame?.Year || 0
    return yearB - yearA
  })

  if (!athlete) {
    return <div>Athlete not found</div>
  }

  return (
    <ScrollArea className='h-[calc(100vh-4rem)] w-full'>
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold text-center mb-4'>
          {athlete.Athlete_Name}
        </h1>
        <div className='flex flex-col items-center'>
          {athlete.Flag && (
            <img
              src={athlete.Flag}
              alt={`Flag of ${athlete.Country_Name}`}
              className='mb-4 w-[100px] h-[60px] object-cover'
            />
          )}
          <p className='text-xl mb-8'>{athlete.Country_Name}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResults.map(result => (
              <TableRow key={result.Id}>
                <TableCell>
                  {result.OlympicGame?.City + ' ' + result.OlympicGame?.Year}
                </TableCell>
                <TableCell>{result.Sport?.Sport}</TableCell>
                <TableCell>{result.Event?.Event}</TableCell>
                <TableCell>{result.Result || 'N/A'}</TableCell>
                <TableCell>
                  {result.Position === -1 ? 'N/A' : result.Position || 'N/A'}
                </TableCell>
                <TableCell>{result.Notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  )
}
