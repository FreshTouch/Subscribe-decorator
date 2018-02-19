import {EventEmitter} from '@angular/core';

export namespace Subscribable {

    interface Subscribables {
        event: any,
        root: Array<string | symbol>
    }

    interface Arguments {
        name: string | symbol,
        root?: boolean
    }

    interface StateParams {
        path: string,
        value: any,
        callback?: Function
    }

    export let Subscribables: any = {};

    export function Subscribe( params: Arguments ) : Function {

        return ( target: any, propertyKey: string | symbol ) : void => {

            let value: any = target[propertyKey],
                subscribeParams: Subscribables = {
                    event: null,
                    root: []
                };

            const getter: any = () : any => value;
            const setter: any = ( val: any ) => {

                if ( ! val.__ )
                {
                    value = val;

                    (<Subscribables>Subscribables[params.name]).event
                        .emit({
                            val,
                            __: !0
                        });
                }
                else
                {
                    value = val.val;
                }
            };

            Reflect.deleteProperty[propertyKey];

            Reflect.defineProperty(target, propertyKey, {
                get: getter,
                set: setter
            });

            if ( ! Subscribables[params.name] )
            {
                subscribeParams.event = new EventEmitter();
                Subscribables[params.name] = subscribeParams;
            }

            if ( params.root )
                (<Subscribables>Subscribables[params.name]).root
                    .push(propertyKey);

            (<Subscribables>Subscribables[params.name]).event
                .subscribe( ( value: any ) : void => {
                    if ( (<Subscribables>Subscribables[params.name]).root.indexOf(propertyKey) < 0 )
                        target[propertyKey] = value;
                });
        }
    }

    export class State {

        public static set( params: StateParams ) : void
        {
            if ( typeof params.value !== 'object' )
                return;

            if ( ! Subscribables.state )
                Subscribables.state = {};

            let path: any = this.collectState(params.path, !0);

            if ( path )
                path.currentPath.last = params.value;
        }

        public static change( params: StateParams ) : void
        {
            if ( ! Subscribables.state )
                return;

            let path: any = this.collectState(params.path);

            if ( path )
            {
                path.currentPath.last[path.name] = params.value;

                if ( params.callback )
                    params.callback();
            }
        }

        public static get( path: string ) : any
        {
            if ( ! Subscribables.state )
                return;

            return this.collectState(path).currentPath;
        }

        private static collectState( path: string, firstInit: boolean = !1 ) : any
        {
            let currentPath: any = Subscribables.state,
                paths: Array<string> = this.collectPath(path);

            if ( paths.length > 3 )
                return !1;

            paths.forEach(( key: string ) : void => {

                if ( firstInit )
                    if( ! currentPath[key] )
                        currentPath[key] = {};

                if ( typeof currentPath[key] == 'object' )
                    currentPath = currentPath[key]
            });

            return {
                currentPath,
                name: paths[paths.length - 1]
            };
        }

        private static collectPath: Function = ( path: string ) : Array<String> =>
            path.split("->");
    }
}
