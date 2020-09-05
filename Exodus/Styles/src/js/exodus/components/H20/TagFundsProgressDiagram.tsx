import * as React from "react";

interface Props {
    required: number,
    collected: number,
    expected: number,
    month: string,
    width: number
}

export class TagFundsProgressDiagram extends React.Component<Props> {
    render() {
        let {width, collected, required, expected, month} = this.props
        const half = width / 2
        let coll,
            exp,
            monthUpper

        if (collected > required) {
            collected = required;
            expected = 0;
        } else {
            if ((collected + expected) > required) {
                expected = required - collected;
            }
        }

        const angle = ((2 * Math.PI * collected) / required) + 0.5 * Math.PI
        const angle2 = ((2 * Math.PI * (collected + expected)) / required) + 0.5 * Math.PI
        const x = half * Math.cos(0.5 * Math.PI)
        const y = half * Math.sin(0.5 * Math.PI)
        if (angle / Math.PI >= 0.5 && angle / Math.PI <= 1.5) coll = `M ${half},${half} L ${x + half},${y + half} A ${half},${half},0,0,1,${half * Math.cos(angle) + half},${half * Math.sin(angle) + half} z`
        if (angle / Math.PI > 1.5 && angle / Math.PI < 2.5) coll = `M ${half},${half} L ${x + half},${y + half} A ${half},${half},0,1,1,${half * Math.cos(angle) + half},${half * Math.sin(angle) + half} z`
        if (angle / Math.PI === 2.5) coll = `M ${half},${half} L ${x + half},${y + half} A ${half},${half},0,1,1,${half * Math.cos(2.4999 * Math.PI) + half},${half * Math.sin(2.4999 * Math.PI) + half} z`
        if (angle2 / Math.PI >= 0.5 && angle2 / Math.PI <= 1.5) exp = `M ${half},${half} L ${x + half},${y + half} A ${half},${half},0,0,1,${half * Math.cos(angle2) + half},${half * Math.sin(angle2) + half} z`
        if (angle2 / Math.PI > 1.5 && angle2 / Math.PI < 2.5) exp = `M ${half},${half} L ${x + half},${y + half} A ${half},${half},0,1,1,${half * Math.cos(angle2) + half},${half * Math.sin(angle2) + half} z`
        if (angle2 / Math.PI === 2.5) exp = `M ${half},${half} L ${x + half},${y + half} A ${half},${half},0,1,1,${half * Math.cos(2.4999 * Math.PI) + half},${half * Math.sin(2.4999 * Math.PI) + half} z`
        monthUpper = month ? month[0].toUpperCase() + month.slice(1) : '';
        const widthStyle = {
            width: `${width}px`,
            height: `${width}px`
        }
        const monthStyle = {
            top: `${width / 5.652}px`,
            left: `${width / 5.652}px`,
            height: `${width / 1.548}px`,
            width: `${width / 1.548}px`
        }

        return (
            <div className='diagram'
                 style={widthStyle}>
                <div className='required'
                     style={widthStyle}> </div>
                <svg className='collected'
                     style={widthStyle}>
                    <path fill="#ffc517" d={coll}/>
                </svg>
                <svg className='expected'
                     style={widthStyle}>
                    <path fill="#999999" d={exp}/>
                </svg>
                <div className='month'
                     style={monthStyle}>
                    <span> {monthUpper} </span>
                </div>
            </div>
        )
    }
}
