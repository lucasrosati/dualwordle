
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RankingEntry } from '../utils/gameLogic';

interface RankingTableProps {
  ranking: RankingEntry[];
}

export function RankingTable({ ranking }: RankingTableProps) {
  return (
    <div className="container mx-auto py-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Ranking</h2>
      <Table>
        <caption className="mt-4 text-sm text-white">
          Lista de jogadores por pontuação
        </caption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] text-white">#</TableHead>
            <TableHead className="text-white">Nome</TableHead>
            <TableHead className="text-white">Acertos</TableHead>
            <TableHead className="text-white">Tentativas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranking.length > 0 ? (
            ranking.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium text-white">{index + 1}</TableCell>
                <TableCell className="text-white">{entry.name}</TableCell>
                <TableCell className="text-white">{entry.acertos}</TableCell>
                <TableCell className="text-white">{entry.attempts}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-white">Nenhum jogador no ranking ainda</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
