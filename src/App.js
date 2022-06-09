import { Box, Button, Center, Container, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spinner, Stack, Table, Tbody, Td, Text, Textarea, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react';
import { createContext, useContext, useEffect, useState } from 'react';

const { ipcRenderer } = window.require('electron');


//TODO: unfuck the organization of this file and split out components into separate files

const DeviceContext = createContext();

export const App = () => {
    const [serials, setSerials] = useState([])
    const [devices, setDevices] = useState([])
    const [devices_new, setDevices_new] = useState([])
    const [reload, setReload] = useState()
    const [promisesResolved, setPromisesResolved] = useState(0)
    const [numPromises, setNumPromises] = useState(0)
    const [selectedAction, setSelectedAction] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [API_KEY, setAPI_KEY] = useState('')
    const [BASE_URL, setBASE_URL] = useState('')
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        ipcRenderer.send('GET_DATA', { message: 'initial' });

        ipcRenderer.on('GET_DATA', (event, {api_key, base_url}) => {
            if(api_key === undefined || base_url === undefined){
                onOpen();
            } else {
                setAPI_KEY(api_key)
                setBASE_URL(base_url)
            }

        })

    },[]);

    const handleOnClickSubmit = () => {
        console.log(API_KEY, BASE_URL)
        ipcRenderer.send('GET_DATA', { message: 'update', api_key: API_KEY, base_url: BASE_URL });
        onClose();
    }

    useEffect(() => {
        const options = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + API_KEY
            }
        };
        setIsLoading(true)
        setDevices([])
        const promiseArr = [];

        serials.forEach((serial) => {
            if (serial.length > 0) {
                promiseArr.push(fetch(BASE_URL + 'hardware/byserial/' + serial, options))

            } else {
                console.log("Skipped bad input:", serial)
            }
        })

        promiseArr.forEach((promise) => {
            promise.then((response) => response.json())
                .then((data) => {
                    if (data.rows?.length) {
                        setDevices_new((prev) => [...prev, data.rows[0]])
                    }
                    setPromisesResolved((prev) => prev + 1)
                })
                .catch(err => console.error(err));
        })


        setNumPromises(promiseArr.length)
    }, [serials, reload]);


    useEffect(() => {
        console.log(promisesResolved)
        if (promisesResolved === numPromises) {
            console.log("Done promising")
            setDevices(devices_new)
            setPromisesResolved(0)
            setDevices_new([])
            setIsLoading(false)
        }
    }, [promisesResolved])

    const onChangeAPIKEYInput = (e) => {
        setAPI_KEY(e.target.value)
    }
    const onChangeBASEURLInput = (e) => {
        setBASE_URL(e.target.value)
    }


    return (
        <DeviceContext.Provider value={devices}>
            <Box w={'100vw'} h={'100vh'} bgColor={'brand.300'} >
                <Container maxW='container.xl' maxH={'100vh'}>
                    <Heading color={'brand.100'}>Snipeit Bulk Action</Heading>
                    <Center>

                        <Stack marginY={4} direction='rows' p={2} bgColor={'brand.100'} h={'90vh'} borderRadius={'8px'}>
                            <Stack minW='240px' p={2}>
                                <SerialModal setSerials={setSerials} />

                                <ActionGroup setReload={setReload} selectedAction={selectedAction} setSelectedAction={setSelectedAction} />



                                <ActionSelect setDevices={setDevices} setIsLoading={setIsLoading} setReload={setReload} selectedAction={selectedAction} setSelectedAction={setSelectedAction} />
                            </Stack>


                            <Box overflowY={'auto'} minW={'600px'}>

                                <DisplayTable />
                                <Center hidden={!isLoading}>
                                    <Spinner size='lg' />
                                </Center>
                            </Box>

                        </Stack>
                    </Center>
                </Container>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color='black' >Enter Serial Numbers</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>

                        <label color='black' >API KEY:</label>
                        <Input onChange={onChangeAPIKEYInput} value={API_KEY}/>
                        <label color='black' >API URL:</label>
                        <Input onChange={onChangeBASEURLInput} value={BASE_URL}/>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleOnClickSubmit}>Submit</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </DeviceContext.Provider>
    );
}

const ActionSelect = ({ setDevices, setIsLoading, setReload, selectedAction, setSelectedAction, API_KEY, BASE_URL }) => {
    if (selectedAction === 'update_status') {
        return <UpdateStatus setDevices={setDevices} setIsLoading={setIsLoading} setReload={setReload} setSelectedAction={setSelectedAction} API_KEY = {API_KEY} BASE_URL={BASE_URL}/>
    }
}

const ActionGroup = ({ selectedAction, setSelectedAction }) => {

    const actionOptions = [
        { value: 'update_status', label: 'Update Status' },
    ]

    const onChangeSelectAction = (e) => {
        setSelectedAction(e.target.value)
    }

    return (
        <Stack>
            <Heading size='md'>Actions</Heading>
            <Text>Available actions:</Text>
            <Select value={selectedAction} onChange={onChangeSelectAction}>
                <option></option>
                {actionOptions.map((action, key) => <option value={action.value} key={key}>{action.label}</option>)}
            </Select>
        </Stack>
    )

}


const UpdateStatus = ({ setDevices, setReload, setSelectedAction, setIsLoading, API_KEY, BASE_URL }) => {
    const [statusLabels, setStatusLabels] = useState([])
    const devices = useContext(DeviceContext);
    const [noteText, setNoteText] = useState();
    const [selectedStatusLabel, setSelectedStatusLabel] = useState();
    const [deviceCount, setDeviceCount] = useState(0);

    const handleOnClickSubmit = () => {
        devices.forEach((device) => {
            const checkinOptions = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status_id: selectedStatusLabel, note: "Device checked in during bulk action." })
            };

            const statusOptions = {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Bearer ' + API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notes: noteText,
                    status_id: selectedStatusLabel
                })
            };
            setIsLoading(true)
            if (device.assigned_to) {
                console.log("Device is checked out and needs to be checked in")

                fetch(BASE_URL + 'hardware/' + device.id + '/checkin', checkinOptions)
                    .then(response => response.json())
                    .then(response => console.log(response))
                    .catch(err => console.error(err));
            }

            fetch(BASE_URL + 'hardware/' + device.id, statusOptions)
                .then(response => response.json())
                .then(response => {
                    console.log(response)
                    setDeviceCount((old_count) => old_count += 1)
                })
                .catch(err => console.error(err));

        })

        setDevices([])
    }

    useEffect(() => {
        if (deviceCount === devices.length) {
            console.log("Done")
            setIsLoading(false)
            setReload(Math.random())
            setSelectedAction('')
        }
    }, [deviceCount, devices, setReload, setSelectedAction]);

    const handleOnChangeStatusLabel = (e) => {
        setSelectedStatusLabel(e.target.value)
    }

    const handleOnChangeNote = (e) => {
        setNoteText(e.target.value)
    }
    useEffect(() => {
        const options = {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: 'Bearer ' + API_KEY
            }
        };

        const arr = []
        fetch(BASE_URL + 'statuslabels', options)
            .then(response => response.json())
            .then(response => response.rows.forEach((status) => {
                arr.push({ value: status.id, label: status.name })
            }))
            .then(() => setStatusLabels(arr))
            .catch(err => console.error(err));


    }, []);

    return (
        <Stack>
            <Heading size='md'>Update Status</Heading>
            <label >Select new status</label>
            <Select id='status_select' value={selectedStatusLabel} onChange={handleOnChangeStatusLabel} >
                {statusLabels.map((option, key) => <option value={option.value} key={key} >{option.label}</option>)}
            </Select>

            <label for='note_field'>Add note</label>
            <Textarea id='note_field' value={noteText} onChange={handleOnChangeNote}></Textarea>
            <Button variant='branded' onClick={handleOnClickSubmit}>Submit</Button>
        </Stack>
    );
}

const SerialModal = ({ setSerials }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [serialText, setSerialText] = useState();

    const handleOnClickSubmit = () => {
        onClose();
        setSerials(serialText.split(/\n/))
    }

    const handleOnChangeSerials = (e) => {
        setSerialText(e.target.value)
    }
    return (
        <>
            <Button variant='branded' onClick={onOpen}>Enter SNs</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader color='black' >Enter Serial Numbers</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>

                        <Text color='black' >Each serial number should appear on a separate line (copying from a Sheet column works)</Text>
                        <Textarea color='black' value={serialText} onChange={handleOnChangeSerials}></Textarea>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' onClick={handleOnClickSubmit}>Submit</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

const DeviceRow = ({ device }) => {
    return (
        <Tr>
            <Td>{device.serial}</Td>
            <Td>{device.assigned_to?.name ? 'Yes' : 'No'}</Td>
            <Td>{device.status_label.name}</Td>
        </Tr>
    )
}

const DisplayTable = () => {
    const devices = useContext(DeviceContext)

    return (
        <Table variant='striped'>
            <Thead>
                <Tr>
                    <Th>Serial Number</Th>
                    <Th>Checked out?</Th>
                    <Th>Status</Th>
                </Tr>
            </Thead>
            <Tbody>
                {devices.map((device, key) => <DeviceRow device={device} key={key} />)}
            </Tbody>
        </Table>
    )
}