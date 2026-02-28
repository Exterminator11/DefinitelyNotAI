export const getRequest = async (url: string, mockResponse?: any) => {
  //   const response = await fetch(url);
  //   return response.json();
  if (mockResponse) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(mockResponse);
      }, 1000);
    });
  }
  return fetch(url).then((response) => response.json());
};
