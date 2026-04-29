import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'number',
    standalone: true
})
export class NumberPipe implements PipeTransform {
  transform(value: number, digits: string = '1.0-0'): string {
    if (value === null || value === undefined) return '';
    
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: parseInt(digits.split('.')[1]) || 0,
      maximumFractionDigits: parseInt(digits.split('.')[1]) || 0
    });
  }
}
