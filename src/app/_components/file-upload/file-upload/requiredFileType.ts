import { FormControl } from '@angular/forms';

export function requiredFileType( type: string ) {
    return function (control: FormControl) {
      const files = control.value;
      if ( files )
      {
        for (let i = 0; i < files.length; i++)
        {
            const extension = files[i].name.split('.')[1].toLowerCase();
               if ( type.toLowerCase() !== extension.toLowerCase() ) {
                  return {
                        requiredFileType: true
                    };
            }
        }
        return null;
      }

      return null;
    };
  }