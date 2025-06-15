import { useEffect, useState } from 'react';
import { DeleteIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { HasAccess } from '../../../redux/accessUtils';
import CommonCheckTable from '../../../components/reactTable/checktable';
import { SearchIcon } from "@chakra-ui/icons";
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { toast } from 'react-toastify';
import { setMeetingLoading, setMeetingData, setMeetingError } from '../../../redux/slices/meetingSlice';
import { useDispatch } from 'react-redux';
import { deleteManyApi, getApi } from 'services/api';

const Index = () => {
    const title = "Meeting";
    const navigate = useNavigate()
    const [action, setAction] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedValues, setSelectedValues] = useState([]);
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
    const [searchboxOutside, setSearchboxOutside] = useState('');
    const [deleteMany, setDeleteMany] = useState(false);
    const [isLoding, setIsLoding] = useState(false);
    const [data, setData] = useState([]);
    const [displaySearchData, setDisplaySearchData] = useState(false);
    const [searchedData, setSearchedData] = useState([]);
    const [permission] = HasAccess(['Meetings'])
    const [edit, setEdit] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const dispatch = useDispatch()


    const actionHeader = {
        Header: "Action", isSortable: false, center: true,
        cell: ({ row }) => (
            <Text fontSize="md" fontWeight="900" textAlign={"center"}>
                <Menu isLazy  >
                    <MenuButton><CiMenuKebab /></MenuButton>
                    <MenuList minW={'fit-content'} transform={"translate(1520px, 173px);"}>

                        {permission?.view && <MenuItem py={2.5} color={'green'}
                            onClick={() => navigate(`/meeting/${row?.values._id}`)}
                            icon={<ViewIcon fontSize={15} />}>View</MenuItem>}
                        {permission?.update && <MenuItem py={2.5} color={'blue'}
                            onClick={() => handleEditMeeting(row?.values)}
                            icon={<EditIcon fontSize={15} />}>Edit</MenuItem>}
                        {permission?.delete && <MenuItem py={2.5} color={'red'} onClick={() => { setDeleteMany(true); setSelectedValues([row?.values?._id]); }} icon={<DeleteIcon fontSize={15} />}>Delete</MenuItem>}
                    </MenuList>
                </Menu>
            </Text>
        )
    }
    const tableColumns = [
        {
            Header: "#",
            accessor: "_id",
            isSortable: false,
            width: 10
        },
        {
            Header: 'Agenda', accessor: 'agenda', cell: (cell) => (
                <Link to={`/meeting/${cell?.row?.values._id}`}> <Text
                    me="10px"
                    sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
                    color='brand.600'
                    fontSize="sm"
                    fontWeight="700"
                >
                    {cell?.value || ' - '}
                </Text></Link>)
        },
        { Header: "Date & Time", accessor: "dateTime", },
        { Header: "Time Stamp", accessor: "timestamp", },
        { Header: "Create By", accessor: "createdByName", },
        ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])

    ];

    const fetchData = async () => {
        setIsLoding(true)
        dispatch(setMeetingLoading(true))
        try {
            const result = await getApi('api/meeting/')
            if (result.status === 200) {
                setData(result?.data);
                dispatch(setMeetingData(result?.data));
            } else {
                toast.error("Failed to fetch data", "error");
                dispatch(setMeetingError("Failed to fetch data"));
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch data", "error");
            dispatch(setMeetingError("Failed to fetch data"));
        } finally {
            setIsLoding(false)
            dispatch(setMeetingLoading(false))
        }
    }

    const handleDeleteMeeting = async (ids) => {
        try {
            setIsLoding(true)
            let response = await deleteManyApi('api/meeting/deleteMany', ids)
            if (response.status === 200) {
                setSelectedValues([])
                setDeleteMany(false)
                setAction((pre) => !pre)
            }
        } catch (error) {
            console.log(error)
        }
        finally {
            setIsLoding(false)
        }
    }

    const handleEditMeeting = (meeting) => {
        setSelectedMeeting(meeting);
        setEdit(true);
        onOpen();
    }

    const handleAddMeeting = () => {
        setSelectedMeeting(null);
        setEdit(false);
        onOpen();
    }

    const handleCloseModal = () => {
        setSelectedMeeting(null);
        setEdit(false);
        onClose();
    }

    // const [selectedColumns, setSelectedColumns] = useState([...tableColumns]);
    // const dataColumn = tableColumns?.filter(item => selectedColumns?.find(colum => colum?.Header === item.Header))


    useEffect(() => {
        fetchData();
    }, [action])

    return (
        <div>
            <CommonCheckTable
                title={title}
                isLoding={isLoding}
                columnData={tableColumns ?? []}
                // dataColumn={dataColumn ?? []}
                allData={data ?? []}
                tableData={data}
                searchDisplay={displaySearchData}
                setSearchDisplay={setDisplaySearchData}
                searchedDataOut={searchedData}
                setSearchedDataOut={setSearchedData}
                tableCustomFields={[]}
                access={permission}
                // action={action}
                // setAction={setAction}
                // selectedColumns={selectedColumns}
                // setSelectedColumns={setSelectedColumns}
                // isOpen={isOpen}
                // onClose={onClose}
                onOpen={handleAddMeeting}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
                setDelete={setDeleteMany}
                AdvanceSearch={
                    <Button variant="outline" colorScheme='brand' leftIcon={<SearchIcon />} mt={{ sm: "5px", md: "0" }} size="sm" onClick={() => setAdvanceSearch(true)}>Advance Search</Button>
                }
                getTagValuesOutSide={getTagValuesOutSide}
                searchboxOutside={searchboxOutside}
                setGetTagValuesOutside={setGetTagValuesOutside}
                setSearchboxOutside={setSearchboxOutside}
                handleSearchType="MeetingSearch"
            />

            <MeetingAdvanceSearch
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                setSearchedData={setSearchedData}
                setDisplaySearchData={setDisplaySearchData}
                allData={data ?? []}
                setAction={setAction}
                setGetTagValues={setGetTagValuesOutside}
                setSearchbox={setSearchboxOutside}
            />
            <AddMeeting 
                setAction={setAction} 
                isOpen={isOpen} 
                onClose={handleCloseModal} 
                edit={edit}
                selectedMeeting={selectedMeeting}
            />

            {/* Delete model */}
            <CommonDeleteModel isOpen={deleteMany} onClose={() => setDeleteMany(false)} type='Meetings' handleDeleteData={handleDeleteMeeting} ids={selectedValues} />
        </div>
    )
}

export default Index
