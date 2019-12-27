import {Tag} from "./motif_types";
 

class MotifApi {
    baseUrl: string;
    constructor() {
        this.baseUrl = "http://localhost:3000"; // todo configure based on dev vs prod
    }

    getTagsFromIds(pageInfo: any): Promise<any> {
        const songNameToIdMap = pageInfo.trackNameToId;
        const songIds = Array.from(songNameToIdMap.keys()).map((key: any) => songNameToIdMap.get(key)).reduce((a: string, b: string) => a + (a == "" ? b : "," + b), "");
        const userId = localStorage.getItem("userId");
        const baseUrl = this.baseUrl;
        var toReturn: any = new Map();
            
        return fetch(`${baseUrl}/songs/tags?userId=${userId}&songIds=${songIds}`, 
            {
                "method": "get"
            })
            .then(resp => resp.json())
            .then(respBody => {
                Array.from(songNameToIdMap.keys()).forEach((name: any) => toReturn.set(name, {
                    id: songNameToIdMap.get(name), 
                    tags: respBody.data[songNameToIdMap.get(name)] ? respBody.data[songNameToIdMap.get(name)].tags : []
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

    addTagToSong(userId: string, tag: string, songId: string): Promise<any> {
        const baseUrl = this.baseUrl
        const body = {
            userId,
            tag,
            songId
        }
        return fetch(`${baseUrl}/songs/tag/add`, 
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