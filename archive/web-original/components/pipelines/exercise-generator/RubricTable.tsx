import type { RubricCriterion } from '../../../lib/markdown';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { SubLabel } from './StudentSection';

export function RubricTable({ rubric }: { rubric: RubricCriterion[] }) {
  return (
    <div>
      <SubLabel>Rúbrica</SubLabel>
      <div className="overflow-x-auto rounded-md border border-border">
        <Table className="text-[12px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <TableHead className="w-[22%]">Criterio</TableHead>
              <TableHead className="text-[#10B981]">Excelente</TableHead>
              <TableHead className="text-amber-600">Aceptable</TableHead>
              <TableHead className="text-destructive">Insuficiente</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rubric.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="align-top font-bold text-foreground">{r.criterion}</TableCell>
                <TableCell className="align-top text-foreground/80 leading-snug">
                  {r.levels.excelente}
                </TableCell>
                <TableCell className="align-top text-foreground/80 leading-snug">
                  {r.levels.aceptable}
                </TableCell>
                <TableCell className="align-top text-foreground/80 leading-snug">
                  {r.levels.insuficiente}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
