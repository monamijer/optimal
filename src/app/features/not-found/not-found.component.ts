import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit, OnDestroy {
  lines: string[] = [];
  private interval: any;

  private sequence = [
    '$ ping 404.page',
    'PING 404.page: 56 data bytes',
    'Request timeout for icmp_seq 0',
    'Request timeout for icmp_seq 1',
    '--- 404.page ping statistics ---',
    '2 packets transmitted, 0 received, 100% packet loss',
    '',
    '$ traceroute optimal.edu/??',
    '1  router.local (192.168.1.1)  1.2ms',
    '2  * * * Request timeout',
    '3  * * * Request timeout',
    '',
    '$ http GET /??',
    'HTTP/1.1 404 Not Found',
    'Content-Type: text/plain',
    '',
    'Error: Route not found.',
    'The page you requested does not exist.',
  ];

  ngOnInit(): void {
    let i = 0;
    this.interval = setInterval(() => {
      if (i < this.sequence.length) {
        this.lines.push(this.sequence[i++]);
      } else {
        clearInterval(this.interval);
      }
    }, 120);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
