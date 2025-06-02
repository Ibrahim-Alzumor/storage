import {HttpEvent, HttpHandlerFn, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';


export function TokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const token = localStorage.getItem('jwt_token');
  const isLoginRequest = req.url.includes('/login');
  if (!isLoginRequest) {

    if (token) {
      req = req.clone({
        setHeaders: {authorization: `Bearer ${token}`}
      });
    }
  }
  return next(req);

}
