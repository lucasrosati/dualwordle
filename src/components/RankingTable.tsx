
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RankingEntry } from '../utils/gameLogic';

interface RankingTableProps {
  ranking: RankingEntry[];
}

export function RankingTable({ ranking }: RankingTableProps) {
  return (
    <div className="container mx-auto py-4">
      <h2 className="text-2xl font-bold mb-4">Ranking</h2>
      <Table>
        <TableCaption>Lista de jogadores por pontuação</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">#</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Acertos</TableHead>
            <TableHead>Tentativas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ranking.length > 0 ? (
            ranking.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.acertos}</TableCell>
                <TableCell>{entry.attempts}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Nenhum jogador no ranking ainda</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
