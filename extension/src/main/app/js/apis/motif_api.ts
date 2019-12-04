class MotifApi {
    baseUrl: string;
    constructor() {
        this.baseUrl = "http://localhost:3000"; // todo configure based on dev vs prod
    }

    getTagsFromIds(pageInfo: any): Promise<any> {
        const songNameToIdMap = pageInfo.trackNameToId;
        const songIds = Object.keys(songNameToIdMap).map(key => songNameToIdMap[key]).reduce((a, b) => a + a == "" ? "" : "," + b, "");
        const userId = localStorage.getItem("userId");
        const baseUrl = this.baseUrl;
        var toReturn: any = {}
            
        return fetch(`${baseUrl}/songs/tags?userId=${userId}&songIds=${songIds}`, 
            {
                "method": "get"
            })
            .then(resp => resp.json())
            .then(respBody => {
                Object.keys(songNameToIdMap).forEach(name => toReturn[name] = {
                    id: songNameToIdMap[name], 
                    tags: respBody.data[songNameToIdMap[name]] || []
                });
                pageInfo.trackNameToMetadata = toReturn;
                return pageInfo;
            }); 
    }
}

export default MotifApi;