import React from 'react';
import { IoMdCheckboxOutline } from "react-icons/io";
import { CiWarning } from "react-icons/ci";
import { HiOutlineXMark } from "react-icons/hi2";
import { FiEdit3 } from "react-icons/fi";

type BaseProps = {
    title?: string;
    type?: string;
};

type EditCompetitionCardProps = BaseProps &  {
    status?: number;
    dates?: Array<Array<string>>;
    editable?: boolean;
}

type TestProps = BaseProps & {
    type: 'test';
    status?: number;
};


type CardProps = EditCompetitionCardProps | TestProps;

/**
 * Card component to display content in a card-like format.
 * @param {CardProps} props - The properties for the Card component.
 * @returns {JSX.Element} The rendered Card component.
 */

const Card: React.FC<CardProps> = (props) => { 
    
    let cardElements: React.ReactNode;

    if(props.type === 'editPage'){
    cardElements = <EditCompetitionCard status={props.status} dates={props.dates} editable={props.editable} />;
    }
    return(
    <div className={` bg-[#FFFBF6] h-40 w-70 rounded-lg shadow-md p-2 m-4`}>
        <div className='text-center top-0.5 text-lg'>
            {props.title}
        </div>
        {cardElements}
        
    </div>
    );
};

const EditCompetitionCard: React.FC<EditCompetitionCardProps> = (props) => {

    let statusSymbol: React.ReactNode;
    let editableSymbol: React.ReactNode;
    if(props.status === 0){
        statusSymbol = <IoMdCheckboxOutline size={'22px'} style={{ color: "green"}}/>
    } else if(props.status === 1){
        statusSymbol = <CiWarning size={'25px'} style={{ color: "orange"}}/>
    } else{
        statusSymbol = <HiOutlineXMark size={'25px'} style={{ color: "red"}}/>
    }
    if(props.editable){
        editableSymbol = <FiEdit3 className="cursor-pointer" size={'22px'} style={{color: "blue"}}/>
    }
    return (
    <div className='flex flex-col'>
        <div className='w-full flex flex-row justify-start items-center mb-0.5'>
            <h3 className='w-1/3 text-end mr-2'>Status:</h3>
            <div className='w-1/3 flex justify-center items-center'>
                {statusSymbol}
            </div>
            <div className='w-1/3'></div>
        </div> 
        {props.dates?.map((date, index) => (
                    <div key={index} className='w-full flex flex-row mt-0.5 mb-0.5 justify-start items-center'>
                        <h3 className='w-1/3 text-end mr-2'>{date[0]}</h3>
                        <div className='w-1/3 flex justify-center items-center'>
                            {date[1]}
                        </div>
                        <div className='w-1/3'></div>
                        
                    </div>
                ))}
        <div className='w-full flex flex-row justify-center items-center mt-2'>
            {editableSymbol}
        </div>
        
    </div>);
}

export default Card;