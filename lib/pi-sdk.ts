// lib/pi-sdk.ts
export const initPiSDK = () => {
  if (typeof window !== 'undefined' && window.Pi) {
    // التحقق من الشبكة
    const isSandbox = process.env.NEXT_PUBLIC_PI_NETWORK === 'testnet';
    
    window.Pi.init({ 
      version: "2.0", 
      sandbox: isSandbox 
    });
    
    console.log('Pi SDK initialized, sandbox:', isSandbox);
    return true;
  }
  return false;
};
