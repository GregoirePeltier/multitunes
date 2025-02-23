import axios, {AxiosInstance} from 'axios';
export interface DeezerTracksData{
    id: number;
    title_short: string;
    link:string;
    preview:string;
    artist: {
        name: string;
    };
    album: {
        cover_medium: string;
    }
}
export interface DeezerChartsData {
    data: DeezerTracksData[];
    total: number;
    next: string;
}

class DeezerService {
    private readonly apiClient: AxiosInstance;

    constructor(baseURL: string = 'https://api.deezer.com') {
        this.apiClient = axios.create({
            baseURL,
            timeout: 5000, // You can configure the timeout value
        });
    }


    async getChartsByGenre(genreId: number): Promise<DeezerChartsData> {
        try {
            const response = await this.apiClient.get(`/chart/${genreId}/tracks?limit=300`);
            return response.data;
        } catch (error: any) {
            console.error('Error while fetching charts by genre on Deezer: ', error.message);
            throw new Error('Failed to fetch charts by genre from Deezer');
        }
    }
    async getTrackDetails(trackId: string): Promise<any> {
        try {
            const response = await this.apiClient.get(`/track/${trackId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error while fetching track details on Deezer: ', error.message);
            throw new Error('Failed to fetch track details from Deezer');
        }
    }

}

export default DeezerService;