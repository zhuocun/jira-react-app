import { Button, Drawer } from "antd";

interface Props {
    isOpened: boolean;
    onClose: () => void;
}

const ProjectModal: React.FC<Props> = ({ isOpened, onClose }) => {
    return (
        <Drawer visible={isOpened} width={"100%"}>
            <h1>Project Modal</h1>
            <Button onClick={onClose}>Close</Button>
        </Drawer>
    );
};

export default ProjectModal;
