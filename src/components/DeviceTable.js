import { Box, Button, Center, Container, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spinner, Stack, Table, Tbody, Td, Text, Textarea, Th, Thead, Tr, useDisclosure } from '@chakra-ui/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { DeviceContext } from '../App';

const DeviceRow = ({ device }) => {
    return (
        <Tr>
            <Td>{device.serial}</Td>
            <Td>{device.location?.name}</Td>
            <Td>{device.assigned_to?.name ? 'Yes' : 'No'}</Td>
            <Td>{device.status_label.name}</Td>
        </Tr>
    )
}

export const DeviceTable = () => {
    const devices = useContext(DeviceContext)
    useEffect(() => {
    }, [devices]);
    if (devices.length > 0) {
        return (
            <Table variant='striped'>
                <Thead>
                    <Tr>
                        <Th>Serial Number</Th>
                        <Th>Location</Th>
                        <Th>Checked out?</Th>
                        <Th>Status</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {devices.map((device, key) => <DeviceRow device={device} key={key} />)}
                </Tbody>
            </Table>
        )
    } else {
        return (
            <Table variant='striped'>
                <Thead>
                    <Tr>
                        <Th>Serial Number</Th>
                        <Th>Location</Th>
                        <Th>Checked out?</Th>
                        <Th>Status</Th>
                    </Tr>
                </Thead>
                <Tbody>
                </Tbody>
            </Table>            
        )
    }
}