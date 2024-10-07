import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/TicketPost';
import '../../src/Avatar';
import {ifDefined} from "lit/directives/if-defined.js";

const meta: Meta = {
  component: 'zn-ticket-post',
  title: 'Components/TicketPost',
  tags: ['components', 'ticket-post'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({time, sender, avatar}) =>
  {
    return `
      <zn-ticket-post
        time="${time}"
        sender="${sender}"
        avatar="${avatar}">
        <div slot="text">Second reply<br>
<br>
On Mon, 7 Oct 2024 at 12:30, John Doe &lt;john.doe@example.com&gt; wrote:<br>
<br>
&gt; Question 1;<br>
&gt;<br>
AAA<br>
<br>
&gt;<br>
&gt; Question 2;<br>
&gt;<br>
BBB<br>
<br>
&gt;<br>
&gt; Question 3;<br>
&gt;<br>
CCC<br>
<br>
&gt;<br>
&gt;<br>
&gt; Thanks<br>
&gt;<br>
&gt;<br>
&gt; *Email Disclaimer*The information contained in this communication is<br>
&gt; intended solely for the use of the individual or entity to whom it is<br>
&gt; addressed and others authorised to receive it. It may contain confidential<br>
&gt; or legally privileged information. If you are not the intended recipient<br>
&gt; you are hereby notified that any disclosure, copying, distribution or<br>
&gt; taking any action in reliance on the contents of this information is<br>
&gt; strictly prohibited and may be unlawful. If you have received this<br>
&gt; communication in error, please notify us immediately by responding to this<br>
&gt; email and then delete it from your system. company is neither<br>
&gt; liable for the proper and complete transmission of the information<br>
&gt; contained in this communication nor for any delay in its receipt.<br>
&gt;<br>
<br>
--<br>
*Email Disclaimer<br>
*The information contained in this communication is<br>
intended solely for the use of the individual or entity to whom it is<br>
addressed and others authorised to receive it. It may contain confidential<br>
or legally privileged information. If you are not the intended recipient<br>
you are hereby notified that any disclosure, copying, distribution or<br>
taking any action in reliance on the contents of this information is<br>
strictly prohibited and may be unlawful. If you have received this<br>
communication in error, please notify us immediately by responding to this<br>
email and then delete it from your system. company is neither<br>
liable for the proper and complete transmission of the information<br>
contained in this communication nor for any delay in its receipt.<br>
</div>
        <div slot="html"><div dir="ltr"><div>Second reply</div><div class="gmail_quote"><div dir="ltr" class="gmail_attr">On Mon, 7 Oct 2024 at 12:30, John Doe &lt;<a href="mailto:john.doe@example.com">john.doe@example.com</a>&gt; wrote:</div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"><div dir="ltr">Question 1; </div></blockquote><div>AAA </div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"><div dir="ltr"><div></div><div>Question 2;</div></div></blockquote><div>BBB </div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"><div dir="ltr"><div></div><div>Question 3;</div></div></blockquote><div>CCC </div><blockquote class="gmail_quote" style="margin:0px 0px 0px 0.8ex;border-left:1px solid rgb(204,204,204);padding-left:1ex"><div dir="ltr"><div></div><div></div><div>Thanks</div></div>


<font size="2"><b>Email Disclaimer</b>The information contained in this communication is intended solely for the use of the individual or entity to whom it is addressed and others authorised to receive it. It may contain confidential or legally privileged information. If you are not the intended recipient you are hereby notified that any disclosure, copying, distribution or taking any action in reliance on the contents of this information is strictly prohibited and may be unlawful. If you have received this communication in error, please notify us immediately by responding to this email and then delete it from your system. company is neither liable for the proper and complete transmission of the information contained in this communication nor for any delay in its receipt.</font></blockquote></div></div>


<font size="2"><b>Email Disclaimer</b>The information contained in this communication is intended solely for the use of the individual or entity to whom it is addressed and others authorised to receive it. It may contain confidential or legally privileged information. If you are not the intended recipient you are hereby notified that any disclosure, copying, distribution or taking any action in reliance on the contents of this information is strictly prohibited and may be unlawful. If you have received this communication in error, please notify us immediately by responding to this email and then delete it from your system. company is neither liable for the proper and complete transmission of the information contained in this communication nor for any delay in its receipt.</font></div>
      </zn-ticket-post>
    `;
  },
  args: {
    time: '11th Oct 2021, 10:00 AM',
    sender: 'John Doe',
    avatar: 'JD',
  }
};
