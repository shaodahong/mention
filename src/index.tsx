import * as React from 'react'
import * as ReactDom from 'react-dom'
import '../assets/index.css'
const { useState, useRef } = React

const propertyNamesToCopy = [
  'box-sizing',
  'font-family',
  'font-size',
  'font-style',
  'font-variant',
  'font-weight',
  'height',
  'letter-spacing',
  'line-height',
  'max-height',
  'min-height',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'border-bottom',
  'border-left',
  'border-right',
  'border-top',
  'text-decoration',
  'text-indent',
  'text-transform',
  'width',
  'word-spacing',
]

function Mention() {
  const [top, setTop] = useState(0)
  const [left, setLeft] = useState(0)
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>()

  const onKeyUp: React.KeyboardEventHandler<HTMLTextAreaElement> = event => {
    const { key } = event

    if (key === '@') {
      const { current } = textareaRef
      const parrent = current.parentElement
      const end = current.selectionEnd
      const child = document.getElementById('mirror')

      if (child && child.parentElement) {
        child.parentElement.removeChild(child)
      }

      const beforeText = current.value.slice(0, end)
      const afterText = current.value.slice(end)

      const escape = function(text: string): string {
        return text.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, '<br>')
      }

      const style = window.getComputedStyle(current)
      const props = []
      props.push(
        'white-space:pre-wrap;position:absolute;top:-2px;left:0;z-index:-1;overflow:auto;word-wrap: break-word;',
      )

      for (let i = 0, len = propertyNamesToCopy.length; i < len; i++) {
        const name = propertyNamesToCopy[i]
        props.push(`${name}:${style.getPropertyValue(name)};`)
      }

      const mirror = document.createElement('div')
      mirror.id = 'mirror'
      mirror.style.cssText = props.join(' ')
      mirror.innerHTML = `${escape(
        beforeText,
      )}<span id="cursor">|</span>${escape(afterText)}`

      parrent.appendChild(mirror)

      const cursor = document.getElementById('cursor')

      const textareaRect = current.getBoundingClientRect()
      const cursorRect = cursor.getBoundingClientRect()

      setTop(
        cursorRect.top -
          textareaRect.top +
          14 -
          (mirror.scrollHeight - parseInt(style.getPropertyValue('height'))),
      )
      setLeft(cursorRect.left - textareaRect.left)
    }
  }

  const onInput: React.FormEventHandler<HTMLTextAreaElement> = event => {
    const { value } = event.target as any
    setValue(value)
  }

  function replaceByPosition(
    text: string,
    start: number,
    stop: number,
    replacetext: string,
  ) {
    return text.substring(0, start) + replacetext + text.substring(stop)
  }

  const onMentionClick = (mention: string) => {
    const { current } = textareaRef
    const end = current.selectionEnd
    const flagIndex = value.lastIndexOf('@', end)

    if (flagIndex < 0) {
      return
    }

    const insertString = `@${mention} `
    const rangPosition = end + insertString.length - 1
    setValue(replaceByPosition(value, flagIndex, end, insertString))
    current.focus()
    setTimeout(() => {
      current.setSelectionRange(rangPosition, rangPosition)
    }, 100)
  }

  return (
    <div className="text-area-wrap">
      <textarea
        className="text-area"
        ref={textareaRef}
        placeholder="placeholder"
        value={value}
        onKeyUp={onKeyUp}
        onInput={onInput}
      ></textarea>
      <ul
        className="mentions"
        style={{
          left,
          top,
        }}
      >
        {['123', '456', '789'].map(v => (
          <li key={v} onClick={onMentionClick.bind(this, v)}>
            {v}
          </li>
        ))}
      </ul>
    </div>
  )
}

ReactDom.render(<Mention />, document.getElementById('root'))
