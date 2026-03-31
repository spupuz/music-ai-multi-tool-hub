export const imageUrlToBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        reject(new Error(`Could not get data URL from canvas. Error: ${e}`));
      }
    };
    img.onerror = (err) => {
      // This can happen due to CORS issues if the server doesn't send the right headers.
      // We will attempt to use a proxy as a fallback.
      console.warn("Direct image fetch failed, trying proxy. Error:", err);
      const proxiedUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
      const proxyImg = new Image();
      proxyImg.crossOrigin = 'Anonymous';
      proxyImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = proxyImg.width;
        canvas.height = proxyImg.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Failed to create canvas context via proxy')); return; }
        ctx.drawImage(proxyImg, 0, 0);
        try { resolve(canvas.toDataURL('image/png')); }
        catch (e) { reject(new Error(`Could not get data URL from canvas via proxy. Error: ${e}`)); }
      };
      proxyImg.onerror = () => {
        reject(new Error(`Failed to load image from URL directly and via proxy. The URL may be invalid or blocked by CORS.`));
      };
      proxyImg.src = proxiedUrl;
    };
    img.src = url;
  });
};

export const isValidHexColor = (color: string): boolean => /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
export const normalizeHexColor = (color: string): string => {
  if (!color.startsWith('#')) color = '#' + color;
  if (color.length === 4) { color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`; }
  return color.toUpperCase();
};
