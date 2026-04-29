import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { EnumMapperUtil } from '../utils/enum-mapper.util';

/**
 * Intercepteur pour mapper les valeurs d'énumération incohérentes entre le backend et le frontend
 */
export const enumMappingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    tap(event => {
      // Intercepter uniquement les réponses HTTP réussies
      if (event instanceof HttpResponse && event.status === 200) {
        const body = event.body;
        
        // Mapper le corps de la réponse si nécessaire
        if (body) {
          try {
            const mappedBody = EnumMapperUtil.mapApiResponse(body);
            
            // Créer une nouvelle réponse avec les données mappées
            event = event.clone({
              body: mappedBody
            });
            
            console.log('ð Enum mapping applied for:', req.url);
          } catch (error) {
            console.warn('â Error during enum mapping:', error);
            // En cas d'erreur, laisser la réponse originale
          }
        }
      }
    })
  );
};
