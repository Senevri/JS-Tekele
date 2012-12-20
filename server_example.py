"""
    Serves http.
"""
import platform

if (platform.python_version_tuple()[0] == '2'):
    import SocketServer
    socketserver = SocketServer
else:
    import socketserver

class MyTCPHandler(socketserver.BaseRequestHandler):
    path = '/home/esa/tekele/Trista/test'
    buffer = []

    header = "HTTP/1.1 200 OK\r\nConnection: close\r\n \
            Content-Type: text/html; charset=UTF-8"
    def handle(self):
        import struct
        import base64
        import subprocess
        import urllib
        self.data = self.request.recv(1024).strip()
        self.buffer.append(self.data)
        print(self.client_address[0], self.data)
        strbytes = str(self.data)
        lines = strbytes.lstrip('b').strip("'").split('\\r\\n')
        reply = ""
        try: 
            for cmd, param in [l.split(' ', 1) for l in lines]:
                if cmd.upper() == 'GET':
                    file_req = param.split(' ', 1)[0]
                    print(file_req)
                    if file_req == '/':
                        file_req = '/index.html'
                    if (file_req[-3:] == 'php') or file_req.count(".php/"):
                        match = file_req.rfind(".php/")
                        if match > 0:
                            args = file_req[match+4:]
                            file_req = file_req[:match+4]
                        proc = subprocess.Popen(['php5-cgi', '-f', ''.join([self.path, file_req]), ''.join(['args=', urllib.quote(args)]) ], 0, None, subprocess.PIPE, subprocess.PIPE, None);
                        reply = '\r\n'.join(proc.stdout.readlines())
                    else:
                        f = open(''.join([self.path, file_req]), 'r')
                        try:
                            reply = f.read()
                        except UnicodeDecodeError as e:
                            # serve binary file
                            f.close()
                            f = open(''.join([self.path, file_req]), 'rb')
                            reply=f.read()
                            self.header = '\r\n'.join([self.header,
                                'Content-Encoding: binary'])

                        finally:
                            f.close()
        except ValueError:
            print (strbytes)

        c_len = "Content-Length: {0}\r\n".format(len(reply))
        header = "HTTP/1.1 404 FAILED\r\n\r\n"

        print (reply)
        if len(reply)>0:
            if type(reply) == str:
                reply = '\r\n'.join([self.header, c_len, reply])
                self.request.send(reply.encode())
            else:
                self.request.send(reply)

        

if __name__ == "__main__":
    HOST, PORT = "localhost", 8000

    # Create the server, binding to localhost on port 9999
    server = socketserver.TCPServer((HOST, PORT), MyTCPHandler)

    # Activate the server; this will keep running until you
    # interrupt the program with Ctrl-C
    server.serve_forever()
