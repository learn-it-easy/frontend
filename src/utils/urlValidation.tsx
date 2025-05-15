export const isValidImageUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
    
      const allowedDomains = [
        'bing.net',
        'mm.bing.net', 
        'tse1.mm.bing.net',
        'tse2.mm.bing.net',
        'tse3.mm.bing.net',
        'tse4.mm.bing.net',
        'avatars.mds.yandex.net'
      ];
      
      /*const isValidDomain = allowedDomains.some(domain => 
        parsedUrl.hostname.endsWith(domain)
      );
      if (!isValidDomain) return false;*/
      
      // Проверка для Yandex Images
      if (parsedUrl.hostname === 'avatars.mds.yandex.net') {
        // Проверяем стандартные форматы Yandex URL
        const isYandexImage = (
          (parsedUrl.pathname === '/i' && parsedUrl.searchParams.has('id')) ||
          parsedUrl.pathname.startsWith('/get-') ||
          parsedUrl.pathname.startsWith('/images/')
        );
        
        return isYandexImage && !hasSuspiciousParams(parsedUrl);
      }
      
      // Проверка для Bing Images
      if (allowedDomains.some(d => parsedUrl.hostname.endsWith(d))) {
        const isBingImage = parsedUrl.pathname.includes('/th/id/');
        const hasBingParams = parsedUrl.searchParams.has('pid');
        return isBingImage && hasBingParams && !hasSuspiciousParams(parsedUrl);
      }
      
      // Проверка для других URL по расширению файла
      const path = parsedUrl.pathname.toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      return validExtensions.some(ext => path.endsWith(ext)) && 
             !hasSuspiciousParams(parsedUrl);
      
    } catch {
      return false;
    }
  };
  
  const hasSuspiciousParams = (parsedUrl: URL): boolean => {
    const suspiciousParams = ['javascript:', 'data:', 'eval(', 'alert('];
    const query = parsedUrl.search.toLowerCase();
    return suspiciousParams.some(param => query.includes(param));
  };