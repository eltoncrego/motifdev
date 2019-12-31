import {Tag} from "./motif_types";
 

class MotifApi {
    baseUrl: string;
    constructor() {
        this.baseUrl = "http://localhost:3000"; // todo configure based on dev vs prod
    }

    getTagsFromIds(pageInfo: any): Promise<any> {
        const trackNameToTrack = pageInfo.trackNameToTrack;
        const songIds = Array.from(trackNameToTrack.keys()).map((key: any) => trackNameToTrack.get(key).id).reduce((a: string, b: string) => a + (a == "" ? b : "," + b), "");
        const userId = localStorage.getItem("userId");
        const baseUrl = this.baseUrl;
        var toReturn: any = new Map();
            
        return fetch(`${baseUrl}/songs/tags?userId=${userId}&songIds=${songIds}`, 
            {
                "method": "get"
            })
            .then(resp => resp.json())
            .then(respBody => {
                Array.from(trackNameToTrack.keys()).forEach((name: any) => toReturn.set(name, {
                    tags: respBody.data[trackNameToTrack.get(name).id] ? respBody.data[trackNameToTrack.get(name).id].tags : [],
                    ...trackNameToTrack.get(name)
                }));

                return {
                    pageType: pageInfo.pageType,
                    trackNameToMetadata: toReturn
                };
            }); 
    }

    getTags(userId: string | null): Promise<Tag[]> {
        if (!userId) {
            return new Promise((resolve, _) => resolve([]));
        }
        const baseUrl = this.baseUrl
        return fetch(`${baseUrl}/tags?userId=${userId}`, 
            {
                "method": "get"
            })
            .then(resp => resp.json())
            .then(respBody => {
                return Object.keys(respBody.data).map(tagId => {
                    var tagData = respBody.data[tagId];
                    return {name: tagData.tag, id: tagData._id};
                })
            });
    }

    addTagToSong(userId: string, tag: string, songId: string, songName: string, artist: string): Promise<any> {
        return this.addOrDeleteTagFromSong(userId, tag, songId, songName, artist);
    }

    deleteTagFromSong(userId: string, tag: string, songId: string): Promise<any> {
        return this.addOrDeleteTagFromSong(userId, tag, songId, "", "", true);
    }

    addOrDeleteTagFromSong(userId: string, tag: string, songId: string, songName: string, artist: string, isDelete: boolean = false): Promise<any> {
        const baseUrl = this.baseUrl
        const body = {
            userId,
            tag,
            songId,
            songName,
            artist
        }

        return fetch(`${baseUrl}/songs/tag/${isDelete ? "delete" : "add"}`, 
            {
                "method": "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                "body": JSON.stringify(body)
            })
            .then(resp => resp.json());
    }

    executeQuery(userId: string, query: string[]): Promise<any> {
        const baseUrl = this.baseUrl
        const body = {
            userId,
            query
        }
        return fetch(`${baseUrl}/search`, 
            {
                "method": "post",
                headers: {
                    'Content-Type': 'application/json'
                },
                "body": JSON.stringify(body)
            })
            .then(resp => resp.json());
    }
}

export default MotifApi;