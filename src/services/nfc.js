/**
 * TODOs - Add eslint, add husky pre-commit hook
 */
 import { useEffect, useState } from "react"

 export const useNfc = () => {
 
   const [ndef, setNdef] = useState()
   const [isNDEFAvailable, setIsNDEFAvailable] = useState()
   const [permission, setPermission] = useState('')
 
   const [readCtrl, setReadCtrl] = useState(new AbortController())
   const [isScanning, setIsScanning] = useState(false)

   const abortHook = (e) => {
        console.log("Inside onabort hook!!", e);
        setIsScanning(false)

        const readCtrl = new AbortController()
        readCtrl.signal.onabort = abortHook;
        setReadCtrl(readCtrl)
        console.log("--- Creating new readCtrl ---");
   }
 
   useEffect(() => {
       console.log(readCtrl.signal)
     const init = async () => {
       if (window.initNfc) {
            return;
       }
       if ("NDEFReader" in window ) { 
         window.initNfc = true;
         console.log(window.initNfc);
        
         setNdef(new NDEFReader()) // eslint-disable-line no-undef
         
         console.log("READER CREATED");
 
         // NDEF availability
         setIsNDEFAvailable(true)
         
         // permission
         const permissionName = "nfc";
         const permissionStatus = await navigator.permissions.query({ name: permissionName });
 
         setPermission(permissionStatus.state)
 
         permissionStatus.onchange = function () {
           setPermission(this.state)
           console.log("PERMISSION STATUS CHANGED ", permissionStatus);
         };
 
         // onabort hook 
         readCtrl.signal.onabort = abortHook;
       } else {
         setIsNDEFAvailable(false)
       }
     }
     init();
   }, [readCtrl.signal])
 
   const read = async () => {
 
     return new Promise(async (resolve, reject) => {
 
       if (isScanning) {
         reject("Error - Reader already scanning")
       }
 
       if (permission === 'denied') {
         reject("Error - Missing permissions, NFC devices blocked ")
       }
 
       if (!isScanning) {
 
         try {
           await ndef.scan({ signal: readCtrl.signal })
           setIsScanning(true)
           ndef.addEventListener("reading", (event) => {
             resolve(event)
             setTimeout(() => {
               console.log("Aborting...")
               readCtrl.abort()
             }, 5000);
           }, { once: true, signal: readCtrl.signal });
 
           ndef.addEventListener("readingerror", (error) => {
             reject(error);
             setTimeout(() => {
               console.log("Aborting...")
               readCtrl.abort()
             }, 5000);
           }, { once: true, signal: readCtrl.signal });
         } catch (error) {
           console.log(`Error! Scan failed to start: ${error}.`)
           readCtrl.abort()
           reject(error);
         }
       }
 
       // Could make sense to add an option to the hook to make it Timeout (Pormise Rejected) after a predefined amount of ms!!
       // setTimeout(() => {
       //   console.log("Timeout"!!");
       // }, 15000);
 
     });
   }
 
   const write = async (message, options) => {
     console.log("INSIDE WRITE FUNCTION");
 
     return new Promise(async (resolve, reject) => {
         try {
           await ndef.write(message, options);
           resolve(true);
         } catch (error) {
           console.log(error)
           reject(false);
         }
     });
   }
 
   const abortReadCtrl = () => {
     console.log("From abortReadCtrl");
     console.log("readCtrl ", readCtrl);
 
     readCtrl.abort()
   }
 
   return {
     isNDEFAvailable: isNDEFAvailable,
     permission,
     read,
     abortReadCtrl,
     write,
     isScanning
   }
 
 }