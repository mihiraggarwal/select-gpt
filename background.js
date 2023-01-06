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

const getResponse = async (question) => {
    return new Promise(async (resolve, reject) => {
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
                                parts: [question]
                            }
                        }
                    ],
                    model: "text-davinci-002-render",
                    parent_message_id: uid()
                })
            })   
            resolve(res.body)
        } catch (e) {
            if (e === "CLOUDFLARE") {
                reject("CLOUDFLARE")
            } else {
                reject("ERROR")
            }
        }
    })
}

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        const question = msg.question
        getResponse(question).then(async answer => {
            const resRead = answer.getReader()
            while (true) {
                const {done, value} = await resRead.read()
                if (done) break
                if (done === undefined || value === undefined) port.postMessage('ERROR')
                const data = new TextDecoder().decode(value)
                port.postMessage(data)
            }
        }).catch((e) => port.postMessage(e))
    })
})
