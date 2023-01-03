const uid = () => {
	const generateNumber = (limit) => {
	   const value = limit * Math.random();
	   return value | 0;
	}
	const generateX = () => {
		const value = generateNumber(16);
		return value.toString(16);
	}
	const generateXes = (count) => {
		let result = '';
		for(let i = 0; i < count; ++i) {
			result += generateX();
		}
		return result;
	}
	const generateconstant = () => {
		const value = generateNumber(16);
		const constant =  (value & 0x3) | 0x8;
		return constant.toString(16);
	}
    
	const generate = () => {
  	    const result = generateXes(8)
  	         + '-' + generateXes(4)
  	         + '-' + '4' + generateXes(3)
  	         + '-' + generateconstant() + generateXes(3)
  	         + '-' + generateXes(12)
  	    return result;
	};
    return generate()
};

const getToken = async () => {
    return new Promise(async (resolve, reject) => {
        const resp = await fetch("https://chat.openai.com/api/auth/session")
        if (resp.status === 403) {
            reject('CLOUDFLARE')
        }
        try {
            const data = await resp.json()
            if (!data.accessToken) {
                reject('ERROR')
            }
            resolve(data.accessToken)
        } catch (err) {
            reject('ERROR')
        }
    })
}

const getResponse = async () => {
    try {
        const accessToken = await getToken();
        const res = await fetch("https://chat.openai.com/backend-api/conversation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken,
            },
            body: JSON.stringify({
                action: "next",
                messages: [
                    {
                        id: uid(),
                        role: "user",
                        content: {
                            content_type: "text",
                            parts: ["Hello"]
                        }
                    }
                ],
                model: "text-davinci-002-render",
                parent_message_id: uid()
            })
        })   

        const data = await res.text()
        return data
    } catch (e) {
        return("ERROR")
    }
}

const main = async () => {
    const data = await getResponse()
    // console.log(data)
    chrome.tabs.onUpdated.addListener(() => {
        chrome.runtime.sendMessage({
            msg: data
        })
    })
}

main()