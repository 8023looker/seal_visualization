import {ODSample} from "@/utils/ODSample";

onmessage = function(message) {
    // console.log(message.data);
    let result = ODSample(...message.data)
    postMessage(result);
}
