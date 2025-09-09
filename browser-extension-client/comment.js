const DEFAULT_FIVE_STAR_XPATH = '/html/body/div/c-wiz/div/div/div/c-wiz/div/div[1]/div[3]/div[1]/div[2]/div/div[5]'
const INFO_BUTTON_XPATH = '/html/body/div/c-wiz/div/div/div/c-wiz/div/div[1]/div[3]/div[1]/div[1]/div/div[2]/span[2]/span/div[1]/button'
const INFO_TEXT_XPATH = '/html/body/div/c-wiz/div/div/div/c-wiz/div/div[1]/div[3]/div[1]/div[1]/div/div[2]/span[2]/span/div[2]'

const HEADING_XPATH = '/html/body/div/div[14]/div/div[1]/div/div/div/div[1]/div[2]/div/div[1]'

const ADDITIONAL_STARS_XPATH = '/html/body/div/c-wiz/div/div/div/c-wiz/div/div[1]/div[3]/div[1]/div[3]'
const ADDITIONAL_STAR_XPATH = (X) => `/html/body/div/c-wiz/div/div/div/c-wiz/div/div[1]/div[3]/div[1]/div[3]/div[${X}]/div/div/div[5]`

const REVIEWS_FRAME_DOCUMENT = () => window.frames['goog-reviews-write-widget'].document

//assuming we r on place link
async function writeComment(comment) {
    clickHeading()
    await sleep(300)

    clickWriteComment()
    await sleep(5000)

    if (isInfoTextOpen()) {
        clickInfoButton()
        await sleep(300)
    }

    clickFiveStar()
    await sleep(300)

    await clickAdditionalFiveStars()
    await sleep(300)

    typeComment(comment)
    await sleep(5000)

    clickShare()
    await sleep(1000)

    clickEnd()
}

function clickHeading() {
    xpathQuery(HEADING_XPATH).click()
}

function clickFiveStar() {
    xpathQuery(DEFAULT_FIVE_STAR_XPATH, REVIEWS_FRAME_DOCUMENT()).click()
}

async function clickAdditionalFiveStars() {
    try {
        const stars = xpathQuery(ADDITIONAL_STARS_XPATH, REVIEWS_FRAME_DOCUMENT()).childNodes

        for (let index = 0; index <= stars.length; index++) {
            try {
                xpathQuery(ADDITIONAL_STAR_XPATH(index), REVIEWS_FRAME_DOCUMENT()).click()
                await sleep(100)
            } catch { }
        }
    } catch (error) {
        console.log(error)
    }
}

function typeComment(comment) {
    REVIEWS_FRAME_DOCUMENT().querySelector('[placeholder="Kişisel deneyiminizi burada paylaşın"]').value = comment
}

function clickWriteComment() {
    document.querySelector('[aria-label="Yorum yazın"]').click()
}

function isInfoTextOpen() {
    try {
        return xpathQuery(INFO_TEXT_XPATH,).getAttribute('jsaction').includes('CLIENT')
    } catch {
        return false
    }

}

function clickInfoButton() {
    xpathQuery(INFO_BUTTON_XPATH,).click()
}

function clickEnd() {
    let endNode

    REVIEWS_FRAME_DOCUMENT().querySelectorAll('span').forEach(node => {
        if (node.textContent.trim() === 'Bitti') {
            endNode = node
        }
    })

    if (endNode) {
        endNode.click()
    }

}

function clickShare() {
    let shareNode

    REVIEWS_FRAME_DOCUMENT().querySelectorAll('span').forEach(node => {
        if (node.textContent.trim() === 'Yayınla') {
            shareNode = node
        }
    })

    if (shareNode) {
        console.log(shareNode)
    }
}

function xpathQuery(xpath, queryDocument = document) {
    return document.evaluate(xpath, queryDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms))
}

window.writeComment = writeComment