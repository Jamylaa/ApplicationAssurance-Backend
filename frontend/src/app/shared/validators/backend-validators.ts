import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';


// Validateur pour le taux de remboursement (0-100%)
 
export function tauxRemboursementValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined) {
      return null;
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      return {
        tauxRemboursementInvalid: {
          message: 'Le taux de remboursement doit être entre 0 et 100%'
        }
      };
    }
    
    return null;
  };
}

 // Validateur pour les montants monétaires (positifs)

export function montantPositifValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined) {
      return null;
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue) || numValue < 0) {
      return {
        montantInvalid: {
          message: 'Le montant doit être un nombre positif'
        }
      };
    }
    
    return null;
  };
}

 // Validateur pour la durée de contrat (minimum 1 mois)

export function dureeContratValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined) {
      return null;
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue) || numValue < 1) {
      return {
        dureeContratInvalid: {
          message: 'La durée du contrat doit être d\'au moins 1 mois'
        }
      };
    }
    
    return null;
  };
}

 // Validateur pour les priorités (nombre positif)

export function prioriteValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined) {
      return null;
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue) || numValue < 1) {
      return {
        prioriteInvalid: {
          message: 'La priorité doit être un nombre positif'
        }
      };
    }
    
    return null;
  };
}

 // Validateur pour le délai de carence (positif)
export function delaiCarenceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined) {
      return null;
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue) || numValue < 0) {
      return {
        delaiCarenceInvalid: {
          message: 'Le délai de carence doit être un nombre positif'
        }
      };
    }
    
    return null;
  };
}

 //Validateur de cohérence pour les durées de contrat

export function dureeContratCoherenceValidator(minControlName: string, maxControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;
    
    if (!form.controls[minControlName] || !form.controls[maxControlName]) {
      return null;
    }
    
    const minDuree = form.controls[minControlName].value;
    const maxDuree = form.controls[maxControlName].value;
    
    if (minDuree !== null && maxDuree !== null && 
        minDuree !== undefined && maxDuree !== undefined &&
        Number(minDuree) > Number(maxDuree)) {
      return {
        dureeContratIncoherence: {
          message: 'La durée minimale doit être inférieure à la durée maximale'
        }
      };
    }
    
    return null;
  };
}

/**
 * Validateur de cohérence pour les âges
 */
export function ageCoherenceValidator(minControlName: string, maxControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;
    
    if (!form.controls[minControlName] || !form.controls[maxControlName]) {
      return null;
    }
    
    const minAge = form.controls[minControlName].value;
    const maxAge = form.controls[maxControlName].value;
    
    if (minAge !== null && maxAge !== null && 
        minAge !== undefined && maxAge !== undefined &&
        Number(minAge) > Number(maxAge)) {
      return {
        ageIncoherence: {
          message: 'L\'âge minimum doit être inférieur à l\'âge maximum'
        }
      };
    }
    
    return null;
  };
}
