import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'date',
    standalone: true
})
export class DatePipe implements PipeTransform {
  transform(value: Date | string, format: string = 'dd/MM/yyyy HH:mm'): string {
    if (!value) return '';
    
    if (typeof value === 'string') {
      // Si c'est déjà une chaîne, la retourner telle quelle
      return value;
    }
    
    const date = new Date(value);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  }
}
