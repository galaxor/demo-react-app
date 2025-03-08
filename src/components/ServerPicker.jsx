import {Button, ButtonGroup} from "@nextui-org/button";
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/card";
import {Form} from "@nextui-org/form";
import {Input} from "@nextui-org/input";

export default function ServerPicker({setServerUrl}) {
  return <>
    <Form onSubmit={serverPickedFn(setServerUrl)}>
    <Card>
      <CardHeader><h1 className="font-bold">What is your Server?</h1></CardHeader>
      <CardBody>
        ProSocial is a Fediverse client. It must communicate with a Fediverse server. If you have one you'd like to communicate with, enter the url below.

        <div className="mt-4">
        <Input name="server_url" label="Server URL" type="url" placeholder="example.org" isRequired autoFocus />
        </div>

      </CardBody>
      <CardFooter>
        <Button type="submit" radius="full" color="primary" variant="solid">Connect</Button>
      </CardFooter>
    </Card>
    </Form>
  </>;
}

function serverPickedFn(setServerUrl) {
  return event => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget));

    const hostName = formData.server_url.replace(/^https:\/\//, '');
    const serverUrl = new URL(`https://${hostName}`);

    localStorage.setItem('serverUrl', serverUrl);
    setServerUrl(serverUrl);
  };
}
