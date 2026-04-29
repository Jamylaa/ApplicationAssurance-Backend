import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { EligibiliteService } from '../../core/services/eligibilite.service';

@Directive({
  selector: '[appEligibiliteValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: EligibiliteValidatorDirective,
      multi: true
    }
  ]
})
export class EligibiliteValidatorDirective implements Validator, OnChanges {
  
  @Input() produitParent: any;
  @Input() packParent: any;
  
  private validateFn: (control: AbstractControl) => ValidationErrors | null = () => null;

  constructor(private eligibiliteService: EligibiliteService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('produitParent' in changes || 'packParent' in changes) {
      this.validateFn = this.createValidator();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.validateFn(control);
  }

  private createValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !this.produitParent) {
        return null;
      }

      const conditionsEnfant = control.value;
      const conditionsParent = this.packParent?.conditionsEligibilite || this.produitParent?.conditionsEligibilite;

      if (!conditionsParent) {
        return null;
      }

      // Validation locale rapide
      if (!this.eligibiliteService.isConditionsCompatible(conditionsParent, conditionsEnfant)) {
        return {
          eligibiliteIncompatible: {
            message: 'Les conditions d\'éligibilité ne sont pas compatibles avec celles du parent'
          }
        };
      }

      return null;
    };
  }
}
