import { Button, Drawer, Form, Input, Select, Spin } from "antd";
import useProjectModal from "../../utils/hooks/useProjectModal";
import useReactMutation from "../../utils/hooks/useReactMutation";
import { useForm } from "antd/lib/form/Form";
import { useEffect } from "react";
import ErrorBox from "../errorBox";
import { useQueryClient } from "react-query";
import styled from "@emotion/styled";

const ProjectModal: React.FC = () => {
    const { isModalOpened, closeModal, editingProject, isLoading } =
        useProjectModal();

    const {
        mutateAsync,
        error,
        isLoading: mutateLoading
    } = editingProject
        ? useReactMutation("projects", "PUT")
        : useReactMutation("projects", "POST");

    const [form] = useForm();
    const onClose = () => {
        closeModal();
        form.resetFields();
    };
    const onFinish = (input: {
        projectName: string;
        organization: string;
        managerId: string;
    }) => {
        mutateAsync({ ...editingProject, ...input }).then(onClose);
    };
    const modalTitle = editingProject ? "Edit Project" : "Create Project";

    useEffect(() => {
        form.setFieldsValue(editingProject);
    }, [editingProject, form]);

    const members = useQueryClient().getQueryData<IMember[]>("users/members");

    return (
        <Drawer
            forceRender={true}
            open={isModalOpened}
            onClose={onClose}
            width={"100%"}
        >
            <Container>
                {isLoading ? (
                    <Spin />
                ) : (
                    <>
                        <h1>{modalTitle}</h1>
                        <ErrorBox error={error} />
                        <Form
                            form={form}
                            layout={"vertical"}
                            style={{ width: "40rem" }}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label={"Project Name"}
                                name={"projectName"}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the project name"
                                    }
                                ]}
                            >
                                <Input placeholder={"Project Name"} />
                            </Form.Item>
                            <Form.Item
                                label={"Organization"}
                                name={"organization"}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter the organization"
                                    }
                                ]}
                            >
                                <Input placeholder={"Organization"} />
                            </Form.Item>
                            <Form.Item
                                label={"Manager"}
                                name={"managerId"}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a manager"
                                    }
                                ]}
                            >
                                <Select placeholder={"Managers"}>
                                    {members?.map((member, index) => (
                                        <Select.Option
                                            value={member._id}
                                            key={index}
                                        >
                                            {member.username}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item style={{ textAlign: "center" }}>
                                <Button
                                    type={"primary"}
                                    htmlType={"submit"}
                                    loading={mutateLoading}
                                >
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Container>
        </Drawer>
    );
};

export default ProjectModal;

const Container = styled.div`
    height: 80vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;
