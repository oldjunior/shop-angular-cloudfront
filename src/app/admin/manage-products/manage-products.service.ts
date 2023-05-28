import { Injectable, Injector } from '@angular/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class ManageProductsService extends ApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  uploadProductsCSV(file: File): Observable<unknown> {
    if (!this.endpointEnabled('import')) {
      console.warn(
        'Endpoint "import" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    return this.getPreSignedUrl(file.name).pipe(
      switchMap((url) =>
        url !== null
          ? this.http.put(url, file, {
              headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'Content-Type': 'text/csv',
              },
            })
          : throwError(() => null)
      ),
      catchError((err: unknown) => of(null))
    );
  }

  private getPreSignedUrl(fileName: string): Observable<string | null> {
    const url = this.getUrl('import', 'import');

    return this.http
      .get<string>(url, {
        params: {
          name: fileName,
        },
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: (localStorage.getItem('auth_token') as string) || '',
        },
      })
      .pipe(
        catchError((err: unknown) => {
          const error = err as HttpErrorResponse;

          alert(error.error.message);
          return of(null);
        })
      );
  }
}
