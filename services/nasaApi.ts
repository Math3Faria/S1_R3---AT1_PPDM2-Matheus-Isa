const API_KEY = "7601MQOl1oejTj8yD5Jvg0xSaepTnCk6SgjatQeS";
export interface Apod {
  title: string;
  date: string;
  url: string;
  hdurl?: string;
  explanation: string;
  media_type: string;
  copyright?: string;
}



export async function getApodByDate(date: string): Promise<Apod> {
  const response = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`
  );

  if (!response.ok) {
    throw new Error("Could not fetch NASA APOD.");
  }

  return await response.json();
}