import { legacyApi } from 'legacy-module';

export function doSomething() {
  legacyApi.callOldEndpoint();
  alert('done');
}
