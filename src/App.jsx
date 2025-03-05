import { Box, Button, Card, CardBody, Center, Flex, Heading, HStack, Icon, Image, Input, Link, SimpleGrid, Skeleton, Spinner, Text } from '@chakra-ui/react';
import { useColorMode } from './components/ui/color-mode';
import { LuSun as SunIcon, LuMoon as MoonIcon } from "react-icons/lu";
import { MdOutlineVerified } from "react-icons/md";
import { Field } from './components/ui/field';
import { RadioCardItem, RadioCardLabel, RadioCardRoot } from './components/ui/radio-card';
import { FaCarSide as CarIcon, FaMotorcycle as ElectricMotorbikeIcon, FaSync as SyncIcon } from "react-icons/fa";
import { FaMotorcycle as MotorbikeIcon } from "react-icons/fa6";
import { useState } from 'react';
import { toaster } from './components/ui/toaster';

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('oto');
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fineDetails, setFineDetails] = useState({});
  const [fineLoading, setFineLoading] = useState({});

  const vehicleTypes = [
    { value: "oto", title: "Ô TÔ", icon: <CarIcon /> },
    { value: "xemay", title: "XE MÁY", icon: <MotorbikeIcon /> },
    { value: "xemaydien", title: "XE MÁY ĐIỆN", icon: <ElectricMotorbikeIcon /> },
  ]

  const handlevehicleTypeChange = ({ value }) => {
    setVehicleType(value);
  };

  const findViolateUnpunished = (data) => {
    let violateUnpunished = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].status === 'Chưa xử phạt') {
        violateUnpunished.push(data[i]);
      }
    }
    return violateUnpunished.length;
  };

  const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      toaster.create({
        description: "Vui lòng nhập biển số xe",
        type: "warning",
      })
      return;
    }

    setLoading(true);
    setViolations([]);
    setFineDetails({});

    try {
      const response = await fetch('https://autobot.site/api/lookup-plate-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: licensePlate.trim(),
          vehicleType,
        }),
      });

      const data = await response.json();
      if (data.status === 200 && data.data.length > 0) {
        console.log(data.data);
        setViolations(data.data);
        toaster.create({
          description: "Tìm thấy " + findViolateUnpunished(data.data) + " vi phạm chưa xử phạt!",
          type: "error",
        });
      } else {
        toaster.create({
          description: "Chúc mừng! Phương tiện của bạn chưa vi phạm!",
          type: "success",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toaster.create({
        description: "Có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau.",
        type: "error",
      })
    } finally {
      setLoading(false);
    }
  };

  const getFine = async (violationBehavior, vehicleType, index) => {
    setFineLoading(prev => ({ ...prev, [index]: true }));

    try {
      const response = await fetch('https://autobot.site/api/chat-bot/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Với lỗi vi phạm "${violationBehavior}", mức phạt là bao nhiêu đối với phương tiện là "${vehicleType}"?`,
        }),
      });

      const data = await response.json();
      setFineDetails((prev) => ({
        ...prev,
        [index]: {
          response: data.response,
          source: data.source,
        },
      }));
    } catch (error) {
      console.error('Error fetching fine:', error);
      toaster.create({
        description: "Không thể tải thông tin mức phạt. Vui lòng thử lại!",
        type: "error",
      });
    } finally {
      setFineLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <>
      <Flex
        background={colorMode === 'dark' ? 'black' : 'white'}
        align="center"
        justify="space-between"
        p={3}
        top={0}
        zIndex="sticky"
        boxShadow="md"
        marginBottom={4}
        position="sticky"
      >
        <Link href="/traffic-fine-lookup" isExternal>
          <Image src="./icon-512x512.png" alt="Chakra UI" boxSize="10" />
        </Link>

        <Flex flex="1" justify="center">
          <Heading
            fontFamily="Inter, sans-serif"
            as="h1"
            size="lg"
          >
            TRA CỨU PHẠT NGUỘI
          </Heading>
        </Flex>

        <Button w={10} h={10}
          onClick={() => toggleColorMode()}
          variant="ghost"
        >
          {colorMode === 'dark' ? <MoonIcon /> : <SunIcon />}
        </Button>
      </Flex>

      <Box padding={4}>
        <Card.Root size="sm" background={colorMode === 'dark' ? 'gray.900' : '#e7f3ff'}>
          <Flex justify="center" p={2} align="center">
            <MdOutlineVerified color={colorMode === 'dark' ? 'white' : '#007BFF'}/>
            <Heading color={colorMode === 'dark' ? 'white' : '#007BFF'} marginStart={2} size="sm" textAlign="center">Dữ liệu được lấy từ Cục CSGT</Heading>
          </Flex>
        </Card.Root>

        <Flex marginTop={4} direction="column">
          <Field label="Biển số xe:">
            <Input size="md" fontSize="sm" colorPalette="blue" placeholder="Ví dụ: 20A99999" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
          </Field>
        </Flex>

        <RadioCardRoot
          marginTop={4}
          orientation="vertical"
          align="center"
          value={vehicleType}
          onValueChange={handlevehicleTypeChange}
          defaultValue="oto"
        >
          <RadioCardLabel>Loại xe:</RadioCardLabel>
          <HStack>
            {vehicleTypes.map((item) => (
              <RadioCardItem
                label={item.title}
                icon={
                  <Icon fontSize="2xl" color="fg.muted">
                    {item.icon}
                  </Icon>
                }
                colorPalette="blue"
                indicator={false}
                key={item.value}
                value={item.value}
                fontSize="sm"
              />
            ))}
          </HStack>
        </RadioCardRoot>

        <Button
          marginTop={4}
          colorPalette="blue"
          size="lg"
          width="full"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" mr={2} />
              Đang kiểm tra
            </>
          ) : (
            <>
              <SyncIcon mr={2} /> Kiểm tra
            </>
          )}
        </Button>
      </Box>

      <Box marginTop={4}>
        {loading && <Flex direction="column">
          <Skeleton m={4} height='100px' />
          <Skeleton m={4} height='100px' />
          <Skeleton m={4} height='100px' />
        </Flex>}

        {!loading && violations.map((violation, index) => (
          <Card.Root key={index} m={4} p={4} background={colorMode === 'dark' ? 'gray.800' : '#fafafa'}>
            <Flex direction="column" gap={2}>
              <Text fontSize="sm"><strong>Biển số:</strong> <Text as="span" bg="blue.500" color="white" fontWeight="bold" px={2} py={1} borderRadius="md">{violation.licensePlate}</Text></Text>
              <Text fontSize="sm"><strong>Loại xe:</strong>  {violation.vehicleType}</Text>
              <Text fontSize="sm"><strong>Thời gian:</strong> {violation.violationTime}</Text>
              <Text fontSize="sm"><strong>Địa điểm:</strong> {violation.violationLocation}</Text>
              <Text fontSize="sm"><strong>Lỗi vi phạm:</strong> {violation.violationBehavior}</Text>
              <Text fontSize="sm">
                <strong>Trạng thái:</strong>{' '}
                <Text as="span" bg={violation.status === 'Chưa xử phạt' ? 'red.500' : 'green.500'} color="white" fontWeight="bold" px={2} py={1} borderRadius="md">
                  {violation.status}
                </Text>
              </Text>
              <Text fontSize="sm"><strong>Đơn vị xử lý:</strong> {violation.violationDetectionUnit}</Text>
              <Button
                size="sm"
                colorPalette="green"
                onClick={() => getFine(violation.violationBehavior, violation.vehicleType, index)}
                disabled={fineLoading[index]} // Disable button khi đang loading
              >
                {fineLoading[index] ? (
                  <>
                    <Spinner size="sm" mr={2} />
                    Đang tra cứu
                  </>
                ) : (
                  'Xem mức phạt'
                )}
              </Button>
              {fineDetails[index] && (
                <Box mt={2} p={2} bg={colorMode === 'dark' ? 'gray.700' : 'gray.200'} borderRadius="md">
                  <Text fontSize="md">
                    <strong>Mức phạt:</strong>{' '}
                  </Text>
                  <Text fontSize="sm">
                    {fineDetails[index].response}
                  </Text>
                  <Card.Root mt={4} bg={colorMode === 'dark' ? 'gray.700' : 'gray.200'} border="none" borderTop="0.5px solid" borderRadius="none">
                    <Text mt={2} fontSize="sm">
                      <strong>Nguồn tham khảo:</strong>{' '}
                      <a href={fineDetails[index].source} target="_blank" rel="noopener noreferrer" style={{ color: '#007BFF' }}>
                        {fineDetails[index].source}
                      </a>
                    </Text>
                  </Card.Root>

                </Box>
              )}
            </Flex>
          </Card.Root>
        ))}
      </Box>
    </>
  );
}

export default App;