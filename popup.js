document.addEventListener("DOMContentLoaded", async () => {

    const getActiveTab = async () => {
        const tabs = await chrome.tabs.query({
            currentWindow: true,
            active: true
        })
        return tabs[0]
    }

    const showPopup = async (answer) => {
        let datalist = await answer.split('data:')
        let data = await datalist.slice(1, datalist.length-2)
        for (let i = 0; i < data.length; i++) {
            let element = data[i]
            element = element.trim()
            element = await JSON.parse(element)
            setTimeout(() => {document.getElementById('p').innerHTML = element.message.content.parts[0]}, (i+1)*200)
        };
    }

    const getData = async (selection) => {
        if (!selection.length == 0) {
            chrome.runtime.sendMessage({question: selection}, showPopup)
        }
    }

    const getSelectedText = async () => {
        const activeTab = await getActiveTab()
        chrome.tabs.sendMessage(activeTab.id, {type: "LOAD"}, getData)
    }

    getSelectedText()
})